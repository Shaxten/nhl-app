import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface LeaderboardEntry {
  id: string;
  display_name: string;
  currency: number;
  bets_won: number;
  bets_lost: number;
  total_winnings: number;
  score_predictions_total?: number;
  score_predictions_correct?: number;
}

function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLeaderboard() {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, currency, bets_won, bets_lost, total_winnings')
      .order('currency', { ascending: false })
      .limit(50);
    
    if (profiles) {
      const enriched = await Promise.all(
        profiles.map(async (profile) => {
          const { data: predictions } = await supabase
            .from('score_predictions')
            .select('status')
            .eq('user_id', profile.id);
          
          const resolved = predictions?.filter(p => p.status === 'correct' || p.status === 'incorrect') || [];
          const correct = resolved.filter(p => p.status === 'correct').length;
          const total = resolved.length;
          
          return {
            ...profile,
            score_predictions_total: total,
            score_predictions_correct: correct
          };
        })
      );
      setLeaders(enriched);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  function getWinRate(won: number, lost: number) {
    const total = won + lost;
    if (total === 0) return 0;
    return ((won / total) * 100).toFixed(1);
  }

  if (loading) return <div className="container"><h1>Loading...</h1></div>;

  return (
    <div className="container">
      <h1>Leaderboard</h1>
      <button onClick={() => { setLoading(true); fetchLeaderboard(); }} style={{ marginTop: '1rem' }}>
        Refresh
      </button>
      <table style={{ marginTop: '2rem' }}>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Currency</th>
            <th>Bets Won</th>
            <th>Bets Lost</th>
            <th>Win Rate</th>
            <th>Score Predictions</th>
            <th>Prediction Accuracy</th>
            <th>Total Winnings</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((leader, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{leader.display_name}</td>
              <td>{leader.currency}</td>
              <td>{leader.bets_won || 0}</td>
              <td>{leader.bets_lost || 0}</td>
              <td>{getWinRate(leader.bets_won || 0, leader.bets_lost || 0)}%</td>
              <td>{leader.score_predictions_correct || 0}/{leader.score_predictions_total || 0}</td>
              <td>{getWinRate(leader.score_predictions_correct || 0, leader.score_predictions_total || 0)}%</td>
              <td style={{ color: (leader.total_winnings || 0) >= 0 ? '#4a9eff' : '#ff4a4a' }}>
                {(leader.total_winnings || 0) >= 0 ? '+' : ''}{leader.total_winnings || 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;
