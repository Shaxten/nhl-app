import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTeams, getTeamPlayers } from '../data';
import { Team, Player } from '../types';

function TeamStats() {
  const { t, language } = useLanguage();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamAbbrev, setSelectedTeamAbbrev] = useState<string>('');
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeams().then(data => {
      setTeams(data);
      if (data.length > 0) {
        const montrealTeam = data.find(team => team.abbrev === 'MTL');
        setSelectedTeamAbbrev(montrealTeam ? montrealTeam.abbrev : data[0].abbrev);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedTeamAbbrev) {
      getTeamPlayers(selectedTeamAbbrev).then(setTeamPlayers);
    }
  }, [selectedTeamAbbrev]);

  if (loading) return <div className="container"><h1>{t.common.loading}</h1></div>;

  const selectedTeam = teams.find(t => t.abbrev === selectedTeamAbbrev);

  return (
    <div className="container">
      <h1>{t.teamStats.title}</h1>
      <select value={selectedTeamAbbrev} onChange={(e) => setSelectedTeamAbbrev(e.target.value)}>
        {teams.sort((a, b) => a.name.localeCompare(b.name)).map(team => (
          <option key={team.abbrev} value={team.abbrev}>
            {team.abbrev} - {language === 'en' ? team.name.replace('Montréal', 'Montreal') : team.name}
          </option>
        ))}
      </select>

      {selectedTeam && (
        <div className="team-stats">
          <h2>
            {language === 'en' ? selectedTeam.name.replace('Montréal', 'Montreal') : selectedTeam.name}
            <img src={`https://assets.nhle.com/logos/nhl/svg/${selectedTeam.abbrev}_light.svg`} alt={selectedTeam.name} style={{ width: '50px', height: '50px', marginLeft: '1rem', verticalAlign: 'middle' }} />
          </h2>
          <div className="stats-summary">
            <div className="stat-box">
              <h3>{selectedTeam.wins}</h3>
              <p>{t.teamStats.wins}</p>
            </div>
            <div className="stat-box">
              <h3>{selectedTeam.losses}</h3>
              <p>{t.teamStats.losses}</p>
            </div>
            <div className="stat-box">
              <h3>{selectedTeam.otLosses}</h3>
              <p>{t.teamStats.otLosses}</p>
            </div>
            <div className="stat-box">
              <h3>{selectedTeam.points}</h3>
              <p>{t.teamStats.points}</p>
            </div>
          </div>

          <h3 style={{ marginTop: '2rem' }}>{language === 'fr' ? `Alignement (${teamPlayers.length} joueurs)` : `Roster (${teamPlayers.length} players)`}</h3>
          <table>
            <thead>
              <tr>
                <th>{language === 'fr' ? 'Joueur' : 'Player'}</th>
                <th>{language === 'fr' ? 'Buts / PJ' : 'Goals / GP'}</th>
                <th>{language === 'fr' ? 'Passes / % Arrêts' : 'Assists / Save %'}</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {teamPlayers.map(player => (
                <tr key={player.id}>
                  <td>{player.name}</td>
                  <td>{player.goals}</td>
                  <td>{player.name.includes('(G)') ? `${player.assists}%` : player.assists}</td>
                  <td>{player.points}</td>
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
