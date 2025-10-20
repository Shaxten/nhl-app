import { useState } from 'react';
import { supabase } from '../supabase';

function Admin() {
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  async function resolveScorePredictions() {
    setProcessing(true);
    setResults([]);
    const logs: string[] = [];

    try {
      logs.push('Resolving score predictions...');
      const { data: pendingPredictions, error: predError } = await supabase
        .from('score_predictions')
        .select('*')
        .eq('status', 'pending');

      if (predError) {
        logs.push(`Error fetching predictions: ${predError.message}`);
      } else if (pendingPredictions && pendingPredictions.length > 0) {
        logs.push(`Found ${pendingPredictions.length} pending predictions`);
        
        const predGameIds = [...new Set(pendingPredictions.map(p => p.game_id))];
        
        for (const gameId of predGameIds) {
          try {
            logs.push(`Checking game ${gameId}...`);
            const response = await fetch(`https://corsproxy.io/?https://api-web.nhle.com/v1/gamecenter/${gameId}/landing`);
            const gameData = await response.json();
            
            logs.push(`Game ${gameId} state: ${gameData.gameState}`);

            if (gameData.gameState !== 'OFF' && gameData.gameState !== 'FINAL') {
              logs.push(`Game ${gameId}: Not finished yet`);
              continue;
            }

            const homeScore = gameData.homeTeam?.score;
            const awayScore = gameData.awayTeam?.score;
            logs.push(`Game ${gameId} final: Away ${awayScore} - Home ${homeScore}`);
            
            const gamePredictions = pendingPredictions.filter(p => p.game_id === gameId);
            logs.push(`Found ${gamePredictions.length} predictions for this game`);

            for (const pred of gamePredictions) {
              const correct = pred.predicted_home_score === homeScore && pred.predicted_away_score === awayScore;
              
              logs.push(`Updating prediction ${pred.id}: predicted ${pred.predicted_away_score}-${pred.predicted_home_score}, actual ${awayScore}-${homeScore}`);
              
              const { error: updateError } = await supabase.from('score_predictions').update({
                status: correct ? 'correct' : 'incorrect',
                actual_home_score: homeScore,
                actual_away_score: awayScore
              }).eq('id', pred.id);

              if (updateError) {
                logs.push(`ERROR updating prediction ${pred.id}: ${updateError.message}`);
              } else {
                logs.push(`Prediction ${pred.id}: ${correct ? 'CORRECT' : 'INCORRECT'}`);
              }
            }
          } catch (error) {
            logs.push(`Error for game ${gameId}: ${error}`);
          }
        }
        logs.push('Score predictions resolution complete!');
      } else {
        logs.push('No pending predictions');
      }
    } catch (error) {
      logs.push(`Error: ${error}`);
    }

    setResults(logs);
    setProcessing(false);
  }

  async function resolveBets() {
    setProcessing(true);
    setResults([]);
    const logs: string[] = [];

    try {
      // Get all pending bets
      const { data: pendingBets } = await supabase
        .from('bets')
        .select('*')
        .eq('status', 'pending');

      if (!pendingBets || pendingBets.length === 0) {
        logs.push('No pending bets to resolve');
        setResults(logs);
        setProcessing(false);
        return;
      }

      logs.push(`Found ${pendingBets.length} pending bets`);

      // Get unique game IDs
      const gameIds = [...new Set(pendingBets.map(bet => bet.game_id))];

      for (const gameId of gameIds) {
        try {
          // Fetch game result
          const response = await fetch(`https://corsproxy.io/?https://api-web.nhle.com/v1/gamecenter/${gameId}/landing`);
          const gameData = await response.json();

          // Check if game is final
          if (gameData.gameState !== 'OFF' && gameData.gameState !== 'FINAL') {
            logs.push(`Game ${gameId}: Not finished yet`);
            continue;
          }

          const homeScore = gameData.homeTeam?.score || 0;
          const awayScore = gameData.awayTeam?.score || 0;
          const homeTeam = gameData.homeTeam?.abbrev;
          const awayTeam = gameData.awayTeam?.abbrev;

          if (homeScore === awayScore) {
            logs.push(`Game ${gameId}: Tie - refunding all bets`);
            // Refund ties
            const gameBets = pendingBets.filter(b => b.game_id === gameId);
            for (const bet of gameBets) {
              if (bet.status !== 'pending') continue;
              
              const { error: betError } = await supabase.from('bets').update({ status: 'refunded' }).eq('id', bet.id).eq('status', 'pending');
              if (betError) continue;
              
              const { data: profile } = await supabase
                .from('profiles')
                .select('currency')
                .eq('id', bet.user_id)
                .single();
              await supabase
                .from('profiles')
                .update({ currency: (profile?.currency || 0) + bet.amount })
                .eq('id', bet.user_id);
            }
            continue;
          }

          const winner = homeScore > awayScore ? homeTeam : awayTeam;
          logs.push(`Game ${gameId}: ${awayTeam} ${awayScore} @ ${homeTeam} ${homeScore} - Winner: ${winner}`);

          // Resolve bets for this game
          const gameBets = pendingBets.filter(b => b.game_id === gameId);
          
          for (const bet of gameBets) {
            // Skip if already processed
            if (bet.status !== 'pending') continue;
            
            const won = bet.team_choice === winner;
            const newStatus = won ? 'won' : 'lost';

            // Update bet status first
            const { error: betError } = await supabase.from('bets').update({ status: newStatus }).eq('id', bet.id).eq('status', 'pending');
            
            // If bet was already updated by another process, skip
            if (betError) {
              logs.push(`  Bet ${bet.id} already processed`);
              continue;
            }

            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', bet.user_id)
              .single();

            if (profile) {
              const updates: any = {
                bets_won: won ? (profile.bets_won || 0) + 1 : profile.bets_won || 0,
                bets_lost: won ? profile.bets_lost || 0 : (profile.bets_lost || 0) + 1,
              };

              if (won) {
                const winnings = bet.amount * 2;
                updates.currency = (profile.currency || 0) + winnings;
                updates.total_winnings = (profile.total_winnings || 0) + bet.amount;
                logs.push(`  User ${profile.display_name}: WON ${bet.amount} (paid ${winnings})`);
              } else {
                updates.total_winnings = (profile.total_winnings || 0) - bet.amount;
                logs.push(`  User ${profile.display_name}: LOST ${bet.amount}`);
              }

              const { error: profileError } = await supabase.from('profiles').update(updates).eq('id', bet.user_id);
              if (profileError) {
                logs.push(`  ERROR updating profile for ${profile.display_name}: ${profileError.message}`);
              }
            }
          }
        } catch (error) {
          logs.push(`Error processing game ${gameId}: ${error}`);
        }
      }

      logs.push('Bet resolution complete!')
      
    } catch (error) {
      logs.push(`Error: ${error}`);
    }

    setResults(logs);
    setProcessing(false);
  }

  return (
    <div className="container">
      <h1>Admin - Resolve Bets</h1>
      <p style={{ marginTop: '1rem', color: '#aaa' }}>
        This will check all pending bets and resolve them based on game results.
      </p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        <button 
          onClick={resolveBets} 
          disabled={processing}
        >
          {processing ? 'Processing...' : 'Resolve Pending Bets'}
        </button>
        <button 
          onClick={resolveScorePredictions} 
          disabled={processing}
          style={{ background: '#4a9eff' }}
        >
          {processing ? 'Processing...' : 'Resolve Score Predictions'}
        </button>
        <button 
          onClick={() => window.location.reload()} 
          style={{ background: '#333' }}
        >
          Refresh Page
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: '2rem', background: '#1a1f3a', padding: '1rem', borderRadius: '8px' }}>
          <h3>Results:</h3>
          {results.map((log, i) => (
            <p key={i} style={{ margin: '0.5rem 0', fontFamily: 'monospace', fontSize: '0.9rem' }}>
              {log}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default Admin;
