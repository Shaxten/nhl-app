import { useState, useEffect } from 'react';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    try {
      const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.espn.com/espn/rss/nhl/news');
      const data = await response.json();
      
      if (data.status === 'ok' && data.items) {
        setNews(data.items.slice(0, 20));
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    }
    setLoading(false);
  }

  if (loading) return <div className="container"><h1>Loading...</h1></div>;

  return (
    <div className="container">
      <h1>NHL News</h1>
      <button onClick={() => { setLoading(true); fetchNews(); }} style={{ marginTop: '1rem' }}>
        Refresh
      </button>
      
      <div style={{ marginTop: '2rem' }}>
        {news.map((item, index) => (
          <div key={index} className="division-card" style={{ marginBottom: '1.5rem' }}>
            <h3>
              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#4a9eff', textDecoration: 'none' }}>
                {item.title}
              </a>
            </h3>
            <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {new Date(item.pubDate).toLocaleDateString()} - {new Date(item.pubDate).toLocaleTimeString()}
            </p>
            <p style={{ marginTop: '1rem', lineHeight: '1.6' }}>
              {item.description.replace(/<[^>]*>/g, '').substring(0, 200)}...
            </p>
            <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#4a9eff', marginTop: '0.5rem', display: 'inline-block' }}>
              Read more →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default News;
