import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Injury {
  player: string;
  position: string;
  returnDate: string;
  status: string;
  comment: string;
}

interface TeamInjuries {
  team: string;
  teamName: string;
  injuries: Injury[];
}

function Injuries() {
  const { language } = useLanguage();
  const [teamInjuries, setTeamInjuries] = useState<TeamInjuries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchInjuries();
  }, [language]);

  async function translateText(text: string): Promise<string> {
    if (language === 'en') return text;
    try {
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=fr&dt=t&q=${encodeURIComponent(text)}`);
      const data = await response.json();
      return data[0][0][0] || text;
    } catch {
      return text;
    }
  }

  async function fetchInjuries() {
    try {
      const response = await fetch('/api/injuries');
      const html = await response.text();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const tables = doc.querySelectorAll('.ResponsiveTable');
      
      const result: TeamInjuries[] = [];
      
      for (const table of tables) {
        const teamEl = table.querySelector('.Table__Title');
        const fullTeamName = teamEl?.textContent?.trim() || '';
        const logoImg = table.querySelector('.Table__Title img');
        const logoSrc = logoImg?.getAttribute('src') || '';
        
        const injuries: Injury[] = [];
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 5) {
            injuries.push({
              player: cells[0]?.textContent?.trim() || '',
              position: cells[1]?.textContent?.trim() || '',
              returnDate: cells[2]?.textContent?.trim() || '',
              status: cells[3]?.textContent?.trim() || '',
              comment: cells[4]?.textContent?.trim() || ''
            });
          }
        });
        
        if (injuries.length > 0) {
          result.push({ team: logoSrc, teamName: fullTeamName, injuries });
        }
      }
      
      if (language === 'fr') {
        for (const teamData of result) {
          for (const injury of teamData.injuries) {
            injury.returnDate = await translateText(injury.returnDate);
            injury.status = await translateText(injury.status);
            injury.comment = await translateText(injury.comment);
          }
        }
      }
      
      setTeamInjuries(result);
    } catch (error) {
      console.error('Error fetching injuries:', error);
    }
    setLoading(false);
  }

  if (loading) return <div className="container"><h1>{language === 'fr' ? 'Chargement...' : 'Loading...'}</h1></div>;
  if (teamInjuries.length === 0) return <div className="container"><h1>{language === 'fr' ? 'Aucune blessure trouvée' : 'No injuries found'}</h1></div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>{language === 'fr' ? 'Blessures' : 'Injuries'}</h1>
        <button onClick={() => { setLoading(true); fetchInjuries(); }} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
          {language === 'fr' ? 'Actualiser' : 'Refresh'}
        </button>
      </div>
      
      {teamInjuries.map((teamData, teamIndex) => (
        <div key={teamIndex} style={{ marginBottom: '2rem' }}>
          <h3 style={{ background: '#2a2a2a', padding: '0.75rem', borderRadius: '4px 4px 0 0', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{teamData.teamName}</span>
            {teamData.team && (
              <img src={teamData.team} alt="team logo" style={{ width: '50px', height: '50px' }} />
            )}
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#1a1a1a' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #333' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>{language === 'fr' ? 'Joueur' : 'Player'}</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>{language === 'fr' ? 'Position' : 'Position'}</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', minWidth: '150px' }}>{language === 'fr' ? 'Date de retour' : 'Return Date'}</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>{language === 'fr' ? 'Statut' : 'Status'}</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>{language === 'fr' ? 'Commentaire' : 'Comment'}</th>
              </tr>
            </thead>
            <tbody>
              {teamData.injuries.map((injury, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '0.75rem' }}>{injury.player}</td>
                  <td style={{ padding: '0.75rem' }}>{injury.position}</td>
                  <td style={{ padding: '0.75rem' }}>{injury.returnDate}</td>
                  <td style={{ padding: '0.75rem' }}>{injury.status}</td>
                  <td style={{ padding: '0.75rem' }}>{injury.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default Injuries;
