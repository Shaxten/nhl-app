import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';
import { clearCache } from '../utils/fetchWithFallback';

function Admin() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  async function resolveScorePredictions() {
    setProcessing(true);
    setResults([]);
    const logs: string[] = [];

    try {
      logs.push('Resolving score predictions for ALL users...');
      const { data: pendingPredictions, error: predError } = await supabase
        .from('score_predictions')
        .select('*')
        .eq('status', 'pending');

      if (predError) {
        logs.push(`Error fetching predictions: ${predError.message}`);
      } else if (pendingPredictions && pendingPredictions.length > 0) {
        const uniqueUsers = new Set(pendingPredictions.map(p => p.user_id));
        logs.push(`Found ${pendingPredictions.length} pending predictions from ${uniqueUsers.size} users`);
        
        const predGameIds = [...new Set(pendingPredictions.map(p => p.game_id))];
        logs.push(`Checking ${predGameIds.length} games...`);
        
        for (const gameId of predGameIds) {
          try {
            const response = await fetch(`https://corsproxy.io/?https://api-web.nhle.com/v1/gamecenter/${gameId}/landing`);
            const gameData = await response.json();

            if (gameData.gameState !== 'OFF' && gameData.gameState !== 'FINAL') {
              logs.push(`Game ${gameId}: Not finished (${gameData.gameState})`);
              continue;
            }

            const homeScore = gameData.homeTeam?.score;
            const awayScore = gameData.awayTeam?.score;
            const gamePredictions = pendingPredictions.filter(p => p.game_id === gameId);
            logs.push(`Game ${gameId} FINAL: ${awayScore}-${homeScore} | Resolving ${gamePredictions.length} predictions`);

            for (const pred of gamePredictions) {
              const correct = pred.predicted_home_score === homeScore && pred.predicted_away_score === awayScore;
              
              const { error: updateError } = await supabase.from('score_predictions').update({
                status: correct ? 'correct' : 'incorrect',
                actual_home_score: homeScore,
                actual_away_score: awayScore
              }).eq('id', pred.id);

              if (updateError) {
                logs.push(`  ERROR: Prediction ${pred.id} - ${updateError.message}`);
              } else {
                if (correct && pred.parlay_amount && pred.parlay_amount > 0) {
                  const { data: profile } = await supabase
                    .from('profiles')
                    .select('currency')
                    .eq('id', pred.user_id)
                    .single();
                  
                  if (profile) {
                    const winnings = Math.round(pred.parlay_amount * (pred.parlay_odds || 1.0));
                    await supabase
                      .from('profiles')
                      .update({ currency: (profile.currency || 0) + winnings })
                      .eq('id', pred.user_id);
                    logs.push(`  ✓ Prediction ${pred.id} (User ${pred.user_id}): CORRECT - PARLAY WON ${pred.parlay_amount} @ ${pred.parlay_odds}x = ${winnings} MC`);
                  }
                } else {
                  logs.push(`  ✓ Prediction ${pred.id} (User ${pred.user_id}): ${correct ? 'CORRECT' : 'INCORRECT'}`);
                }
              }
            }
          } catch (error) {
            logs.push(`ERROR game ${gameId}: ${error}`);
          }
        }
        logs.push('✓ Score predictions resolution complete!');
      } else {
        logs.push('No pending predictions to resolve');
      }
    } catch (error) {
      logs.push(`ERROR: ${error}`);
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
      } else {
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

            const odds = bet.odds || 2.0;
            const { error: resolveError } = await supabase.rpc('admin_resolve_bet', {
              bet_id: bet.id,
              new_status: newStatus,
              user_id_param: bet.user_id,
              bet_amount_param: bet.amount,
              bet_odds_param: odds
            });

            if (resolveError) {
              logs.push(`  ERROR resolving bet ${bet.id}: ${resolveError.message}`);
            } else {
              if (won) {
                const winnings = Math.round(bet.amount * odds);
                logs.push(`  Bet ${bet.id}: WON ${bet.amount} @ ${odds.toFixed(2)}x (paid ${winnings})`);
              } else {
                logs.push(`  Bet ${bet.id}: LOST ${bet.amount}`);
              }
            }
          }
        } catch (error) {
          logs.push(`Error processing game ${gameId}: ${error}`);
        }
      }

        logs.push('Bet resolution complete!');
      }

      // Now resolve parlays
      logs.push('\n--- Resolving Parlays ---');
      const { data: pendingParlays } = await supabase
        .from('parlay_bets')
        .select('*')
        .eq('status', 'pending');

      if (!pendingParlays || pendingParlays.length === 0) {
        logs.push('No pending parlays to resolve');
      } else {
        logs.push(`Found ${pendingParlays.length} pending parlays`);

        for (const parlay of pendingParlays) {
          const selections = parlay.selections;
          let allGamesFinished = true;
          let allCorrect = true;

          for (const selection of selections) {
            const gameId = selection.game_id || selection.gameId;
            try {
              const response = await fetch(`https://corsproxy.io/?https://api-web.nhle.com/v1/gamecenter/${gameId}/landing`);
              const gameData = await response.json();

              if (gameData.gameState !== 'OFF' && gameData.gameState !== 'FINAL') {
                allGamesFinished = false;
                break;
              }

              const homeScore = gameData.homeTeam?.score || 0;
              const awayScore = gameData.awayTeam?.score || 0;
              const winner = homeScore > awayScore ? gameData.homeTeam?.abbrev : awayScore > homeScore ? gameData.awayTeam?.abbrev : 'TIE';

              if (winner === 'TIE' || selection.team !== winner) {
                allCorrect = false;
              }
            } catch (error) {
              logs.push(`  Error checking game ${gameId}: ${error}`);
              allGamesFinished = false;
              break;
            }
          }

          if (!allGamesFinished) {
            logs.push(`  Parlay ${parlay.id}: Not all games finished yet`);
            continue;
          }

          const newStatus = allCorrect ? 'won' : 'lost';
          const { error: parlayError } = await supabase.rpc('admin_resolve_parlay', {
            parlay_id: parlay.id,
            new_status: newStatus,
            user_id_param: parlay.user_id,
            bet_amount_param: parlay.bet_amount,
            potential_win_param: parlay.potential_win
          });

          if (parlayError) {
            logs.push(`  ERROR resolving parlay ${parlay.id}: ${parlayError.message}`);
          } else {
            if (allCorrect) {
              logs.push(`  Parlay ${parlay.id}: WON - Paid ${parlay.potential_win} MC`);
            } else {
              logs.push(`  Parlay ${parlay.id}: LOST - ${parlay.bet_amount} MC`);
            }
          }
        }

        logs.push('Parlay resolution complete!');
      }
      
    } catch (error) {
      logs.push(`Error: ${error}`);
    }

    setResults(logs);
    setProcessing(false);
  }

  // Check if user is authorized
  if (!profile || (profile.display_name !== 'Po' && profile.display_name !== 'Nikita')) {
    return (
      <div className="container">
        <h1>Access Denied</h1>
        <p style={{ marginTop: '1rem', color: '#ff4a4a' }}>
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>{t.admin.title}</h1>
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
        <button 
          onClick={() => { clearCache(); alert('Cache cleared!'); }} 
          style={{ background: '#ff8c00' }}
        >
          Clear Cache
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: '2rem', background: '#1a1f3a', padding: '1rem', borderRadius: '8px' }}>
          <h3>Results:</h3>
          {results.map((log, i) => (
              <p key={i} className="pSmall" style={{ margin: '0.5rem 0', fontFamily: 'monospace' }}>
              {log}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default Admin;
