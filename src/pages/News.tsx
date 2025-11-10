import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

function News() {
  const { language } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, [language]);

  async function fetchNews() {
    try {
      if (language === 'fr') {
        // RDS RSS feed
        const rssUrl = 'https://www.rds.ca/arc/outboundfeeds/rss/category/hockey/lnh/?outputType=xml';
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        const data = await response.json();
        
        if (data.status === 'ok' && data.items) {
          setNews(data.items.slice(0, 20));
        }
      } else {
        // ESPN RSS feed
        const rssUrl = 'https://www.espn.com/espn/rss/nhl/news';
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        const data = await response.json();
        
        if (data.status === 'ok' && data.items) {
          setNews(data.items.slice(0, 20));
        }
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    }
    setLoading(false);
  }

  if (loading) return <div className="container"><h1>Loading...</h1></div>;

  return (
    <div className="container">
      <h1>{language === 'fr' ? 'Les nouvelles dans le monde de la LNH' : 'News from the NHL world'}</h1>
      <button onClick={() => { setLoading(true); fetchNews(); }} style={{ marginTop: '1rem', cursor: 'pointer' }}>
        {language === 'fr' ? 'Actualiser' : 'Refresh'}
      </button>
      
      <div style={{ marginTop: '2rem' }}>
        {news.map((item, index) => (
          <div key={index} className="division-card" style={{ marginBottom: '1.5rem' }}>
            <h3>
              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#4a9eff', textDecoration: 'none' }}>
                {item.title}
              </a>
            </h3>
            <p className="pSmall" style={{ color: '#aaa', marginTop: '0.5rem' }}>
              {new Date(item.pubDate).toLocaleDateString()} - {new Date(item.pubDate).toLocaleTimeString()}
            </p>
            <p className="news-description" style={{ marginTop: '1rem' }}>
              {item.description.replace(/<[^>]*>/g, '').substring(0, 200)}...
            </p>
            <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#4a9eff', marginTop: '0.5rem', display: 'inline-block' }}>
              {language === 'fr' ? 'Lire la suite →' : 'Read more →'}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default News;
