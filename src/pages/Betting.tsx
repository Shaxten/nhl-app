import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUpcomingGames, placeBet } from '../data';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

interface Game {
  id: number;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  homeRecord?: string;
  awayRecord?: string;
}

function Betting() {
  const { user, profile, refreshProfile } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [betAmount, setBetAmount] = useState<{ [key: number]: number }>({});
  const navigate = useNavigate();

  useEffect(() => {
    getUpcomingGames().then(data => {
      setGames(data);
      setLoading(false);
    });
  }, []);

  async function handleScorePrediction(gameId: number, homeTeam: string, awayTeam: string) {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if user already has a prediction for this game
    const { data: existing } = await supabase
      .from('score_predictions')
      .select('id')
      .eq('user_id', user.id)
      .eq('game_id', gameId)
      .single();

    if (existing) {
      alert('You already have a prediction for this game. Use the Score Predictions page to edit it.');
      return;
    }

    const awayScore = parseInt((document.getElementById(`away-${gameId}`) as HTMLInputElement).value);
    const homeScore = parseInt((document.getElementById(`home-${gameId}`) as HTMLInputElement).value);

    if (isNaN(awayScore) || isNaN(homeScore)) {
      alert('Please enter valid scores');
      return;
    }

    try {
      await supabase.from('score_predictions').insert({
        user_id: user.id,
        game_id: gameId,
        home_team: homeTeam,
        away_team: awayTeam,
        predicted_home_score: homeScore,
        predicted_away_score: awayScore,
        status: 'pending'
      });
      alert('Score prediction submitted!');
      (document.getElementById(`away-${gameId}`) as HTMLInputElement).value = '';
      (document.getElementById(`home-${gameId}`) as HTMLInputElement).value = '';
    } catch (error) {
      alert('Failed to submit prediction');
    }
  }

  async function handleBet(gameId: number, teamChoice: 'home' | 'away') {
    if (!user || !profile) {
      navigate('/auth');
      return;
    }

    const game = games.find(g => g.id === gameId);
    if (game) {
      const gameTime = new Date(game.startTime);
      const now = new Date();
      const timeDiff = (now.getTime() - gameTime.getTime()) / (1000 * 60);
      
      if (timeDiff > 30) {
        alert('Betting closed: Game started more than 30 minutes ago');
        return;
      }
    }

    const amount = betAmount[gameId] || 0;
    if (amount <= 0 || amount > profile.currency) {
      alert('Invalid bet amount');
      return;
    }

    try {
      const game = games.find(g => g.id === gameId);
      if (!game) return;
      
      await placeBet(user.id, gameId, teamChoice === 'home' ? game.homeTeam : game.awayTeam, amount, game.homeTeam, game.awayTeam);
      await refreshProfile();
      alert('Bet placed successfully!');
      setBetAmount({ ...betAmount, [gameId]: 0 });
    } catch (error) {
      alert('Failed to place bet');
    }
  }

  if (loading) return <div className="container"><h1>Loading...</h1></div>;

  return (
    <div className="container">
      <h1>Upcoming Games - Place Your Bets</h1>
      {profile && (
        <div className="betting-currency" style={{ marginTop: '1rem' }}>
          Available Currency: <strong>{profile.currency}</strong>
        </div>
      )}
      <div style={{ marginTop: '2rem' }}>
        {games.map(game => {
          const gameTime = new Date(game.startTime);
          const now = new Date();
          const timeDiff = (now.getTime() - gameTime.getTime()) / (1000 * 60);
          const bettingClosed = timeDiff > 30;
          
          return (
          <div key={game.id} className="division-card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <img src={game.awayTeamLogo} alt={game.awayTeam} style={{ width: '80px', height: '80px' }} />
                <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>{game.awayTeam}</p>
                <p className="pSmall" style={{ color: '#aaa', marginTop: '0.25rem' }}>{game.awayRecord}</p>
              </div>
              <div className="game-vs" style={{ fontWeight: 'bold' }}>@</div>
              <div style={{ textAlign: 'center' }}>
                <img src={game.homeTeamLogo} alt={game.homeTeam} style={{ width: '80px', height: '80px' }} />
                <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>{game.homeTeam}</p>
                <p className="pSmall" style={{ color: '#aaa', marginTop: '0.25rem' }}>{game.homeRecord}</p>
              </div>
            </div>
            <p style={{ color: '#aaa', marginBottom: '1rem', textAlign: 'center' }}>
              {new Date(game.startTime).toLocaleString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </p>
            <div style={{ marginTop: '1rem' }}>
              <input
                type="number"
                placeholder="Bet amount"
                value={betAmount[game.id] || ''}
                onChange={(e) => setBetAmount({ ...betAmount, [game.id]: Number(e.target.value) })}
                style={{ padding: '0.5rem', marginRight: '1rem', width: '150px' }}
                min="1"
              />
            </div>
            {bettingClosed ? (
              <p style={{ color: '#ff4a4a', marginTop: '1rem' }}>Betting closed</p>
            ) : (
              <>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                  <button onClick={() => handleBet(game.id, 'away')}>
                    Bet on {game.awayTeam}
                  </button>
                  <button onClick={() => handleBet(game.id, 'home')}>
                    Bet on {game.homeTeam}
                  </button>
                </div>
                {(game.homeTeam === 'MTL' || game.awayTeam === 'MTL') && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: '#333', borderRadius: '4px' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Predict Final Score (MTL Game)</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="number"
                        placeholder={game.awayTeam}
                        min="0"
                        style={{ width: '60px', padding: '0.5rem' }}
                        id={`away-${game.id}`}
                      />
                      <span>-</span>
                      <input
                        type="number"
                        placeholder={game.homeTeam}
                        min="0"
                        style={{ width: '60px', padding: '0.5rem' }}
                        id={`home-${game.id}`}
                      />
                      <button onClick={() => handleScorePrediction(game.id, game.homeTeam, game.awayTeam)}>
                        Submit Prediction
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
        })}
      </div>
    </div>
  );
}

export default Betting;
