import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getCachedData, setCachedData, clearCache } from '../utils/cache';

interface Transaction {
  team: string;
  description: string;
}

interface TransactionDay {
  date: string;
  transactions: Transaction[];
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

function Transactions() {
  const { language } = useLanguage();
  const [transactionsByDay, setTransactionsByDay] = useState<TransactionDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = getCachedData<TransactionDay[]>(`transactions_${language}`);
    if (cached) {
      setTransactionsByDay(cached);
      setLoading(false);
    } else {
      setLoading(true);
      fetchTransactions();
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

  async function fetchTransactions() {
    try {
      const response = await fetch('/api/transactions');
      const html = await response.text();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const tables = doc.querySelectorAll('.ResponsiveTable');
      
      const grouped: { [key: string]: Transaction[] } = {};
      
      tables.forEach(table => {
        const dateEl = table.querySelector('.Table__Title');
        const date = dateEl?.textContent || 'Unknown';
        
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const link = row.querySelector('a');
          const teamMatch = link?.getAttribute('href')?.match(/\/name\/([a-z]+)\//);
          const team = teamMatch ? teamMatch[1].toUpperCase() : 'NHL';
          const desc = row.querySelector('td:last-child span')?.textContent || '';
          
          if (desc) {
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push({ team, description: desc });
          }
        });
      });
      
      const result = Object.entries(grouped).map(([date, transactions]) => ({ date, transactions }));
      
      if (language === 'fr') {
        for (const day of result) {
          const translated = await translateText(day.date);
          day.date = translated.charAt(0).toUpperCase() + translated.slice(1);
          for (const transaction of day.transactions) {
            transaction.description = await translateText(transaction.description);
          }
        }
      }
      
      setTransactionsByDay(result);
      setCachedData(`transactions_${language}`, result);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
    setLoading(false);
  }

  if (loading) return <div className="container"><h1>{language === 'fr' ? 'Chargement...' : 'Loading...'}</h1></div>;
  if (transactionsByDay.length === 0) return <div className="container"><h1>{language === 'fr' ? 'Aucune transaction trouvée' : 'No transactions found'}</h1></div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>{language === 'fr' ? 'Transactions' : 'Transactions'}</h1>
        <button onClick={() => { clearCache(`transactions_${language}`); setLoading(true); fetchTransactions(); }} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
          {language === 'fr' ? 'Actualiser' : 'Refresh'}
        </button>
      </div>
      
      {transactionsByDay.map((day, dayIndex) => (
        <div key={dayIndex} style={{ marginBottom: '2rem' }}>
          <h3 style={{ background: '#2a2a2a', padding: '0.75rem', borderRadius: '4px 4px 0 0', margin: 0 }}>{day.date}</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#1a1a1a' }}>
            <tbody>
              {day.transactions.map((transaction, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    {teamLogos[transaction.team] && (
                      <img src={teamLogos[transaction.team]} alt={transaction.team} style={{ width: '50px', height: '50px' }} />
                    )}
                  </td>
                  <td style={{ padding: '0.75rem' }}>{transaction.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default Transactions;
