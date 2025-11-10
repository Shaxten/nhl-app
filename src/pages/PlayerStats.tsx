import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTopPlayers, getTopGoalies } from '../data';
import { Player } from '../types';

type FilterType = 'points' | 'goals' | 'assists' | 'goalies';

function PlayerStats() {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<FilterType>('points');
  const [players, setPlayers] = useState<Player[]>([]);
  const [goalies, setGoalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTopPlayers(),
      getTopGoalies()
    ]).then(([playersData, goaliesData]) => {
      setPlayers(playersData);
      setGoalies(goaliesData);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching data:', err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="container"><h1>{t.common.loading}</h1></div>;

  const sortedPlayers = filter === 'goalies' 
    ? goalies.slice(0, 20)
    : [...players].sort((a, b) => b[filter] - a[filter]).slice(0, 20);

  return (
    <div className="container">
      <h1>{t.playerStats.title}</h1>
      <div className="filters">
        <button 
          className={filter === 'points' ? 'active' : ''} 
          onClick={() => setFilter('points')}
        >
          {t.playerStats.points}
        </button>
        <button 
          className={filter === 'goals' ? 'active' : ''} 
          onClick={() => setFilter('goals')}
        >
          {t.playerStats.goals}
        </button>
        <button 
          className={filter === 'assists' ? 'active' : ''} 
          onClick={() => setFilter('assists')}
        >
          {t.playerStats.assists}
        </button>
        <button 
          className={filter === 'goalies' ? 'active' : ''} 
          onClick={() => setFilter('goalies')}
        >
          {language === 'fr' ? 'Gardiens (% Arrêts)' : 'Goalies (Save %)'}
        </button>
      </div>

      {filter === 'goalies' ? (
        <table>
          <thead>
            <tr>
              <th>{language === 'fr' ? 'Rang' : 'Rank'}</th>
              <th>{language === 'fr' ? 'Gardien' : 'Goalie'}</th>
              <th>{language === 'fr' ? 'Équipe' : 'Team'}</th>
              <th>{language === 'fr' ? 'PJ' : 'GP'}</th>
              <th>{language === 'fr' ? '% Arrêts' : 'Save %'}</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((goalie, index) => (
              <tr key={goalie.id}>
                <td>{index + 1}</td>
                <td>{goalie.name}</td>
                <td>
                  <img src={goalie.teamLogo} alt={goalie.teamAbbrev} style={{ width: '40px', height: '40px' }} />
                </td>
                <td>{goalie.gamesPlayed}</td>
                <td>{goalie.savePct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table>
          <thead>
            <tr>
              <th>{language === 'fr' ? 'Rang' : 'Rank'}</th>
              <th>{language === 'fr' ? 'Joueur' : 'Player'}</th>
              <th>{language === 'fr' ? 'Équipe' : 'Team'}</th>
              <th>{language === 'fr' ? 'Buts' : 'Goals'}</th>
              <th>{language === 'fr' ? 'Passes' : 'Assists'}</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr key={player.id}>
                <td>{index + 1}</td>
                <td>{player.name}</td>
                <td>
                  <img src={player.teamLogo} alt={player.teamAbbrev} style={{ width: '40px', height: '40px' }} />
                </td>
                <td>{player.goals}</td>
                <td>{player.assists}</td>
                <td>{player.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PlayerStats;
