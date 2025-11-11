import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getCachedData, setCachedData, clearCache } from '../utils/cache';

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
  teamAbbrev: string;
  injuries: Injury[];
}

const teamLogos: { [key: string]: string } = {
  'ANA': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/ana.png&h=80&w=80',
  'BOS': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/bos.png&h=80&w=80',
  'BUF': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/buf.png&h=80&w=80',
  'CAR': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/car.png&h=80&w=80',
  'CBJ': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/cbj.png&h=80&w=80',
  'CGY': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/cgy.png&h=80&w=80',
  'CHI': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/chi.png&h=80&w=80',
  'COL': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/col.png&h=80&w=80',
  'DAL': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/dal.png&h=80&w=80',
  'DET': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/det.png&h=80&w=80',
  'EDM': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/edm.png&h=80&w=80',
  'FLA': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/fla.png&h=80&w=80',
  'LA': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/la.png&h=80&w=80',
  'MIN': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/min.png&h=80&w=80',
  'MTL': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/mtl.png&h=80&w=80',
  'NJ': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/nj.png&h=80&w=80',
  'NSH': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/nsh.png&h=80&w=80',
  'NYI': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/nyi.png&h=80&w=80',
  'NYR': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/nyr.png&h=80&w=80',
  'OTT': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/ott.png&h=80&w=80',
  'PHI': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/phi.png&h=80&w=80',
  'PIT': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/pit.png&h=80&w=80',
  'SEA': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/sea.png&h=80&w=80',
  'SJ': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/sj.png&h=80&w=80',
  'STL': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/stl.png&h=80&w=80',
  'TB': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/tb.png&h=80&w=80',
  'TOR': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/tor.png&h=80&w=80',
  'UTA': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/uta.png&h=80&w=80',
  'VAN': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/van.png&h=80&w=80',
  'VGK': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/vgk.png&h=80&w=80',
  'WPG': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/wpg.png&h=80&w=80',
  'WSH': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/wsh.png&h=80&w=80'
};

function Injuries() {
  const { language } = useLanguage();
  const [teamInjuries, setTeamInjuries] = useState<TeamInjuries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getCachedData<TeamInjuries[]>(`injuries_${language}`);
    if (cached) {
      setTeamInjuries(cached);
      setLoading(false);
    } else {
      setLoading(true);
      fetchInjuries();
    }
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
      const isDev = import.meta.env.DEV;
      const url = isDev ? '/api/injuries' : 'https://corsproxy.io/?' + encodeURIComponent('https://www.espn.com/nhl/injuries');
      const response = await fetch(url);
      const html = await response.text();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const tables = doc.querySelectorAll('.ResponsiveTable');
      
      const result: TeamInjuries[] = [];
      
      for (const table of tables) {
        const teamEl = table.querySelector('.Table__Title');
        const fullTeamName = teamEl?.textContent?.trim() || '';
        
        const teamAbbrevMap: { [key: string]: string } = {
          'Anaheim Ducks': 'ANA', 'Boston Bruins': 'BOS', 'Buffalo Sabres': 'BUF',
          'Carolina Hurricanes': 'CAR', 'Columbus Blue Jackets': 'CBJ', 'Calgary Flames': 'CGY',
          'Chicago Blackhawks': 'CHI', 'Colorado Avalanche': 'COL', 'Dallas Stars': 'DAL',
          'Detroit Red Wings': 'DET', 'Edmonton Oilers': 'EDM', 'Florida Panthers': 'FLA',
          'Los Angeles Kings': 'LA', 'Minnesota Wild': 'MIN', 'Montreal Canadiens': 'MTL', 'Montréal Canadiens': 'MTL',
          'New Jersey Devils': 'NJ', 'Nashville Predators': 'NSH', 'New York Islanders': 'NYI',
          'New York Rangers': 'NYR', 'Ottawa Senators': 'OTT', 'Philadelphia Flyers': 'PHI',
          'Pittsburgh Penguins': 'PIT', 'Seattle Kraken': 'SEA', 'San Jose Sharks': 'SJ',
          'St. Louis Blues': 'STL', 'Tampa Bay Lightning': 'TB', 'Toronto Maple Leafs': 'TOR',
          'Utah Hockey Club': 'UTA', 'Vancouver Canucks': 'VAN', 'Vegas Golden Knights': 'VGK',
          'Winnipeg Jets': 'WPG', 'Washington Capitals': 'WSH'
        };
        let teamAbbrev = teamAbbrevMap[fullTeamName];
        if (!teamAbbrev) {
          const lowerName = fullTeamName.toLowerCase();
          if (lowerName.includes('montr') || lowerName.includes('canadien')) {
            teamAbbrev = 'MTL';
          } else {
            teamAbbrev = '';
          }
        }
        
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
          result.push({ team: '', teamName: fullTeamName, teamAbbrev, injuries });
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
      setCachedData(`injuries_${language}`, result);
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
        <button onClick={() => { clearCache(`injuries_${language}`); setLoading(true); fetchInjuries(); }} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
          {language === 'fr' ? 'Actualiser' : 'Refresh'}
        </button>
      </div>
      
      {teamInjuries.map((teamData, teamIndex) => (
        <div key={teamIndex} style={{ marginBottom: '2rem' }}>
          <h3 style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '4px 4px 0 0', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{teamData.teamName}</span>
            {teamLogos[teamData.teamAbbrev] && (
              <img src={teamLogos[teamData.teamAbbrev]} alt={teamData.teamAbbrev} style={{ width: '40px', height: '40px' }} />
            )}
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-primary)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>{language === 'fr' ? 'Joueur' : 'Player'}</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>{language === 'fr' ? 'Position' : 'Position'}</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', minWidth: '150px' }}>{language === 'fr' ? 'Date de retour' : 'Return Date'}</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>{language === 'fr' ? 'Statut' : 'Status'}</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>{language === 'fr' ? 'Commentaire' : 'Comment'}</th>
              </tr>
            </thead>
            <tbody>
              {teamData.injuries.map((injury, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
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
