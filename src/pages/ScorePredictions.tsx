import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../supabase';

interface Prediction {
  id: number;
  game_id: number;
  home_team: string;
  away_team: string;
  predicted_home_score: number;
  predicted_away_score: number;
  actual_home_score?: number;
  actual_away_score?: number;
  status: string;
  created_at: string;
}

function ScorePredictions() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState({ total: 0, correct: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadPredictions();
  }, [user]);

  async function loadPredictions() {
    const { data } = await supabase
      .from('score_predictions')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setPredictions(data);
      const resolved = data.filter(p => p.status === 'correct' || p.status === 'incorrect');
      const correct = data.filter(p => p.status === 'correct').length;
      setStats({ total: resolved.length, correct });
    }
    setLoading(false);
  }

  async function handleEdit(predId: number) {
    const awayScore = prompt('Enter away team score:');
    const homeScore = prompt('Enter home team score:');
    
    if (!awayScore || !homeScore) return;

    const { error } = await supabase
      .from('score_predictions')
      .update({
        predicted_away_score: parseInt(awayScore),
        predicted_home_score: parseInt(homeScore)
      })
      .eq('id', predId);

    if (error) {
      alert('Failed to update prediction');
    } else {
      loadPredictions();
    }
  }

  function canEdit(pred: Prediction) {
    if (pred.status !== 'pending') return false;
    
    const gameStart = new Date(pred.created_at);
    const now = new Date();
    const minutesPassed = (now.getTime() - gameStart.getTime()) / (1000 * 60);
    
    return minutesPassed <= 15;
  }

  if (loading) return <div className="container"><h1>{t.common.loading}</h1></div>;

  return (
    <div className="container">
      <h1>{t.scorePredictions.title}</h1>
      <div className="stats-summary" style={{ marginTop: '2rem' }}>
        <div className="stat-box">
          <h3>{stats.total}</h3>
          <p>{language === 'fr' ? 'Total de prédictions' : 'Total Predictions'}</p>
        </div>
        <div className="stat-box">
          <h3>{stats.correct}</h3>
          <p>{language === 'fr' ? 'Correct' : 'Correct'}</p>
        </div>
        <div className="stat-box">
          <h3>{stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(1) : 0} %</h3>
          <p>{language === 'fr' ? 'Précision' : 'Accuracy'}</p>
        </div>
      </div>

      <table className="predictions-table" style={{ marginTop: '2rem' }}>
        <thead>
          <tr>
            <th>{t.scorePredictions.game}</th>
            <th>{t.scorePredictions.prediction}</th>
            <th>{t.scorePredictions.actual}</th>
            <th>{t.scorePredictions.status}</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map(pred => (
            <tr key={pred.id}>
              <td>{pred.away_team} @ {pred.home_team}</td>
              <td>{pred.predicted_away_score} - {pred.predicted_home_score}</td>
              <td>
                {pred.actual_away_score !== null && pred.actual_away_score !== undefined && 
                 pred.actual_home_score !== null && pred.actual_home_score !== undefined
                  ? `${pred.actual_away_score} - ${pred.actual_home_score}`
                  : '-'}
              </td>
              <td>
                <span style={{
                          color: pred.status === 'correct' ? '#a8d5ff' : pred.status === 'incorrect' ? '#ff4a4a' : '#aaa'
                }}>
                  {pred.status === 'pending' ? t.scorePredictions.pending : pred.status === 'correct' ? t.scorePredictions.correct : t.scorePredictions.incorrect}
                </span>
              </td>
              <td>{new Date(pred.created_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
              <td>
                {canEdit(pred) ? (
                  <button onClick={() => handleEdit(pred.id)} style={{ padding: '0.25rem 0.5rem' }}>
                    {t.scorePredictions.edit}
                  </button>
                ) : (
                  <span style={{ color: '#666' }}>-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ScorePredictions;
