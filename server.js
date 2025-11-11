import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

const NHL_API = 'https://api-web.nhle.com/v1';

app.get('/api/*', async (req, res) => {
  const path = req.params[0];
  const url = `${NHL_API}/${path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/transactions', async (req, res) => {
  try {
    const response = await fetch('https://www.espn.com/nhl/transactions');
    const html = await response.text();
    
    const transactions = [];
    const dateRegex = /<div class="Table__Title">([^<]+)<\/div>/g;
    const tableRegex = /<tbody class="Table__TBODY">(.*?)<\/tbody>/gs;
    
    let dateMatch;
    const dates = [];
    while ((dateMatch = dateRegex.exec(html)) !== null) {
      dates.push(dateMatch[1]);
    }
    
    let tableMatch;
    let tableIndex = 0;
    while ((tableMatch = tableRegex.exec(html)) !== null) {
      const tbody = tableMatch[1];
      const rowRegex = /<tr class="Table__TR[^"]*"[^>]*>(.*?)<\/tr>/gs;
      let rowMatch;
      
      while ((rowMatch = rowRegex.exec(tbody)) !== null) {
        const row = rowMatch[1];
        const teamMatch = row.match(/\/name\/([a-z]+)\//);
        const descMatch = row.match(/<span>([^<]+)<\/span>/);
        
        if (teamMatch && descMatch) {
          transactions.push({
            date: dates[tableIndex] || 'Unknown',
            team: teamMatch[1].toUpperCase(),
            description: descMatch[1]
          });
        }
      }
      tableIndex++;
    }
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.listen(3001, () => {
  console.log('Proxy server running on http://localhost:3001');
});
