import { useState, useEffect } from 'react';
import { getTeams, getTeamPlayers } from '../data';
import { Team, Player } from '../types';

function TeamStats() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamAbbrev, setSelectedTeamAbbrev] = useState<string>('');
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeams().then(data => {
      setTeams(data);
      if (data.length > 0) {
        setSelectedTeamAbbrev(data[0].abbrev);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedTeamAbbrev) {
      getTeamPlayers(selectedTeamAbbrev).then(setTeamPlayers);
    }
  }, [selectedTeamAbbrev]);

  if (loading) return <div className="container"><h1>Loading...</h1></div>;

  const selectedTeam = teams.find(t => t.abbrev === selectedTeamAbbrev);

  return (
    <div className="container">
      <h1>Team Statistics</h1>
      <select value={selectedTeamAbbrev} onChange={(e) => setSelectedTeamAbbrev(e.target.value)}>
        {teams.map(team => (
          <option key={team.abbrev} value={team.abbrev}>{team.name}</option>
        ))}
      </select>

      {selectedTeam && (
        <div className="team-stats">
          <h2>{selectedTeam.name}</h2>
          <div className="stats-summary">
            <div className="stat-box">
              <h3>{selectedTeam.wins}</h3>
              <p>Wins</p>
            </div>
            <div className="stat-box">
              <h3>{selectedTeam.losses}</h3>
              <p>Losses</p>
            </div>
            <div className="stat-box">
              <h3>{selectedTeam.otLosses}</h3>
              <p>OT Losses</p>
            </div>
            <div className="stat-box">
              <h3>{selectedTeam.points}</h3>
              <p>Points</p>
            </div>
          </div>

          <h3 style={{ marginTop: '2rem' }}>Roster ({teamPlayers.length} players)</h3>
          <table>
            <thead>
              <tr>
                <th>Player</th>
              </tr>
            </thead>
            <tbody>
              {teamPlayers.map(player => (
                <tr key={player.id}>
                  <td>{player.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TeamStats;
