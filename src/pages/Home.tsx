import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import hockeyImage from '/images/newhook.jpg'
function Home() {
  const { language } = useLanguage();
  return (
      <div className="container mt">
          <div className="grid">
              <div>
                  <h1 className="anim">{language === 'fr' ? 'L’Analyse du banc' : 'The Rink Report'}</h1>
                  <p className="anim2" style={{ marginTop: '2rem', maxWidth: '80%', marginRight: '1rem' }}>
                    {language === 'fr' 
                          ? "Suis chaque jeu, compare les performances des équipes et des joueurs de la LNH en temps réel, et mets ton instinct de hockeyeur à l’épreuve en plaçant des paris virtuels avec ta monnaie du jeu, les Millcoins !"
                          : 'Track every play, compare NHL team and player stats in real time, and put your hockey instincts to the test by placing virtual bets with Millcoins, your currency for bragging rights on the ice!'}
                  </p>
                  <div className="buttons">                 
                      <Link to="/players" className="bouton1">{language === 'fr' ? 'Voir les meilleurs pointeurs' : 'View top scorers'}</Link>
                      <Link to="/betting" className="bouton2">{language === 'fr' ? 'Bet sur les matchs' : 'Bet on games'}</Link>
                  </div>
              </div>
              <div>
                  <img className="fade" src={hockeyImage} alt="Hockey Stats Tracker" style={{ maxWidth: '100%', height: 'auto' }} />
              </div>
          </div>
    </div>
  );
}

export default Home;
