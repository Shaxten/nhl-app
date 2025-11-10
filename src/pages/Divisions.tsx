import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTeams } from '../data';
import { Team } from '../types';

function Divisions() {
  const { t, language } = useLanguage();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const divisions = ['Atlantic', 'Metropolitan', 'Central', 'Pacific'];
  
  const divisionNames: Record<string, Record<string, string>> = {
    'Atlantic': { en: 'Atlantic', fr: 'Atlantique' },
    'Metropolitan': { en: 'Metropolitan', fr: 'Métropolitain' },
    'Central': { en: 'Central', fr: 'Centrale' },
    'Pacific': { en: 'Pacific', fr: 'Pacifique' }
  };
  
  const translateTeamName = (name: string): string => {
    if (language === 'fr') {
      return name
        .replace('Carolina', 'Caroline')
        .replace('Philadelphia', 'Philadelphie');
    }
    return name;
  };

  useEffect(() => {
    getTeams().then(data => {
      setTeams(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="container"><h1>{t.common.loading}</h1></div>;

  return (
    <div className="container">
      <h1>{t.divisions.title}</h1>
      <div className="divisions-grid">
        {divisions.map(division => {
          const divisionTeams = teams
            .filter(team => team.division === division)
            .sort((a, b) => b.points - a.points);

          return (
            <div key={division} className="division-card">
              <h2>{divisionNames[division][language]}</h2>
              <table>
                <thead>
                  <tr>
                    <th>{t.divisions.team}</th>
                    <th>{t.divisions.gp}</th>
                    <th>{t.divisions.record}</th>
                    <th>{t.divisions.points}</th>
                  </tr>
                </thead>
                <tbody>
                  {divisionTeams.map(team => (
                    <tr key={team.abbrev}>
                      <td>{translateTeamName(team.name)}</td>
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
