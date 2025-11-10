import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
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
  const { t, language } = useLanguage();
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

  if (loading) return <div className="container"><h1>{t.common.loading}</h1></div>;

  return (
    <div className="container">
      <h1>{t.leaderboard.title}</h1>
      <button onClick={() => { setLoading(true); fetchLeaderboard(); }} style={{ marginTop: '1rem' }}>
        {language === 'fr' ? 'Actualiser' : 'Refresh'}
      </button>
      <table style={{ marginTop: '2rem' }}>
        <thead>
          <tr style={{ textAlign: 'right' }}>
            <th>{t.leaderboard.rank}</th>
            <th>{t.leaderboard.player}</th>
            <th>{t.leaderboard.currency}</th>
            <th>{language === 'fr' ? 'Bets gagnés' : 'Bets Won'}</th>
            <th>{language === 'fr' ? 'Bets perdus' : 'Bets Lost'}</th>
            <th>{language === 'fr' ? 'Taux de victoire' : 'Win Rate'}</th>
            <th>{language === 'fr' ? 'Total de prédictions' : 'Total Predictions'}</th>
            <th>{language === 'fr' ? 'Prédictions correctes' : 'Correct Predictions'}</th>
            <th>{language === 'fr' ? 'Précision' : 'Prediction Accuracy'}</th>
            <th>{language === 'fr' ? 'Gains totaux' : 'Total Winnings'}</th>
          </tr>
        </thead>
        <tbody className="tableright">
          {leaders.map((leader, index) => (
            <tr key={index} style={{ textAlign: 'right' }}>
              <td>{index + 1}</td>
              <td>{leader.display_name}</td>
              <td>{leader.currency} MC</td>
              <td>{leader.bets_won || 0}</td>
              <td>{leader.bets_lost || 0}</td>
              <td>{getWinRate(leader.bets_won || 0, leader.bets_lost || 0)} %</td>
              <td>{leader.score_predictions_total || 0}</td>
              <td>{leader.score_predictions_correct || 0}</td>
              <td>
                {(leader.score_predictions_total || 0) > 0 
                  ? `${((leader.score_predictions_correct || 0) / (leader.score_predictions_total || 1) * 100).toFixed(1)} %`
                  : '0 %'}
              </td>
                  <td style={{ color: (leader.total_winnings || 0) >= 0 ? '#4ade80' : '#ff4a4a' }}>
                {(leader.total_winnings || 0) >= 0 ? '+ ' : (leader.total_winnings || 0) < 0 ? '- ' : ''}{Math.abs(leader.total_winnings || 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;
