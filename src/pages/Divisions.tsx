import { useState, useEffect } from 'react';
import { getTeams } from '../data';
import { Team } from '../types';

function Divisions() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const divisions = ['Atlantic', 'Metropolitan', 'Central', 'Pacific'];

  useEffect(() => {
    getTeams().then(data => {
      setTeams(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="container"><h1>Loading...</h1></div>;

  return (
    <div className="container">
      <h1>Division Standings</h1>
      <div className="divisions-grid">
        {divisions.map(division => {
          const divisionTeams = teams
            .filter(team => team.division === division)
            .sort((a, b) => b.points - a.points);

          return (
            <div key={division} className="division-card">
              <h2>{division}</h2>
              <table>
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>GP</th>
                    <th>W-L-OT</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {divisionTeams.map(team => (
                    <tr key={team.abbrev}>
                      <td>{team.name}</td>
                      <td>{team.gamesPlayed}</td>
                      <td>{team.wins}-{team.losses}-{team.otLosses}</td>
                      <td>{team.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Divisions;
