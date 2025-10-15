import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUpcomingGames, placeBet } from '../data';
import { useNavigate } from 'react-router-dom';

interface Game {
  id: number;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
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
        <div style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
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
            <h2>{game.awayTeam} @ {game.homeTeam}</h2>
            <p style={{ color: '#aaa', marginBottom: '1rem' }}>
              {new Date(game.startTime).toLocaleString()}
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
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button onClick={() => handleBet(game.id, 'away')}>
                  Bet on {game.awayTeam}
                </button>
                <button onClick={() => handleBet(game.id, 'home')}>
                  Bet on {game.homeTeam}
                </button>
              </div>
            )}
          </div>
        );
        })}
      </div>
    </div>
  );
}

export default Betting;
