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

app.listen(3001, () => {
  console.log('Proxy server running on http://localhost:3001');
});
