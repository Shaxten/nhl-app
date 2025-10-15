import { useState, useEffect } from 'react';
import { getTopPlayers } from '../data';
import { Player } from '../types';

type FilterType = 'points' | 'goals' | 'assists';

function PlayerStats() {
  const [filter, setFilter] = useState<FilterType>('points');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopPlayers().then(data => {
      console.log('Players data:', data);
      setPlayers(data);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching players:', err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="container"><h1>Loading...</h1></div>;
  if (players.length === 0) return <div className="container"><h1>No players found</h1></div>;

  const sortedPlayers = [...players]
    .sort((a, b) => b[filter] - a[filter])
    .slice(0, 20);

  return (
    <div className="container">
      <h1>Top 20 Players</h1>
      <div className="filters">
        <button 
          className={filter === 'points' ? 'active' : ''} 
          onClick={() => setFilter('points')}
        >
          Points
        </button>
        <button 
          className={filter === 'goals' ? 'active' : ''} 
          onClick={() => setFilter('goals')}
        >
          Goals
        </button>
        <button 
          className={filter === 'assists' ? 'active' : ''} 
          onClick={() => setFilter('assists')}
        >
          Assists
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Team</th>
            <th>Goals</th>
            <th>Assists</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player, index) => (
            <tr key={player.id}>
              <td>{index + 1}</td>
              <td>{player.name}</td>
              <td>{player.teamAbbrev}</td>
              <td>{player.goals}</td>
              <td>{player.assists}</td>
              <td>{player.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PlayerStats;
