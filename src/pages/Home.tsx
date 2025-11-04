import { Link } from 'react-router-dom';
import hockeyImage from '../../public/images/newhook.jpg'
function Home() {
  return (
      <div className="container mt">
          <div className="grid">
              <div>
                  <h1 className="anim">Statistiques de hockey</h1>
                  <p className="anim2" style={{ fontSize: '1.2rem', marginTop: '2rem', lineHeight: '1.8', maxWidth: '80%', marginRight: '1rem' }}>
                    Bienvenue au Statistiques de hockey, l'application web qui vous permet de visualiser les statistiques de hockey pour les equipes les joueurs et qui vous permet de placer des paries avec de l'argent virtuel!
                  </p>
                  <div className="buttons">                 
                      <Link to="/players" className="bouton1">Voir meilleurs pointeurs</Link>
                      <Link to="/betting" className="bouton2">Parier sur les matchs</Link>
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
