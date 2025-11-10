import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import Home from './pages/Home';
import Divisions from './pages/Divisions';
import TeamStats from './pages/TeamStats';
import PlayerStats from './pages/PlayerStats';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Betting from './pages/Betting';
import MyBets from './pages/MyBets';
import ScorePredictions from './pages/ScorePredictions';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import News from './pages/News';

function Navigation() {
  const { user, profile, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="desktop-nav">
        <ul style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <li><Link to="/">{t.nav.home}</Link></li>
            <li><Link to="/news">{t.nav.news}</Link></li>
            <li className="dropdown">
              <span><Link to="/players">{t.nav.stats} ▾</Link></span>
              <ul className="dropdown-menu">
                <li><Link to="/divisions">{t.nav.divisions}</Link></li>
                <li><Link to="/teams">{t.nav.teamStats}</Link></li>
                <li><Link to="/players">{t.nav.playerStats}</Link></li>
              </ul>
            </li>
            <li className="dropdown">
             <span><Link to="/betting">{t.nav.betting} ▾</Link></span>
              <ul className="dropdown-menu">
                {user && <li><Link to="/my-bets">{t.nav.myBets}</Link></li>}
                {user && <li><Link to="/score-predictions">{t.nav.scorePredictions}</Link></li>}
                <li><Link to="/leaderboard">{t.nav.leaderboard}</Link></li>
              </ul>
            </li>     
            {user ? (
              <li><Link to="/profile">{profile?.display_name}</Link></li>
            ) : (
              <li><Link to="/auth">{t.nav.signIn}</Link></li>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <li>
              <button onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')} style={{ padding: '0.5rem 1rem', background: '#ccc', color: '#000' }}>
                {language === 'en' ? 'FR' : 'EN'}
              </button>
            </li>
            <li><Link to="/admin">{t.nav.admin}</Link></li>
            {user && <li><button onClick={signOut} style={{ padding: '0.5rem 1rem' }}>{t.nav.signOut}</button></li>}
          </div>
        </ul>
      </nav>

      {/* Mobile Bootstrap Navbar */}
      <nav className="navbar navbar-expand-xl navbar-dark mobile-nav" style={{ background: '#1a1a1a', borderBottom: '1px solid #333' }}>
        <div className="container-fluid">
          <Link className="navbar-brand" to="/" style={{ color: '#a8d5ff' }}>Hockey Stats</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><Link className="nav-link" to="/">{t.nav.home}</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/news">{t.nav.news}</Link></li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">{t.nav.stats}</a>
                <ul className="dropdown-menu" style={{ background: '#1a1a1a' }}>
                  <li><Link className="dropdown-item" to="/divisions" style={{ color: '#fff' }}>{t.nav.divisions}</Link></li>
                  <li><Link className="dropdown-item" to="/teams" style={{ color: '#fff' }}>{t.nav.teamStats}</Link></li>
                  <li><Link className="dropdown-item" to="/players" style={{ color: '#fff' }}>{t.nav.playerStats}</Link></li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">{t.nav.betting}</a>
                <ul className="dropdown-menu" style={{ background: '#1a1a1a' }}>
                  <li><Link className="dropdown-item" to="/betting" style={{ color: '#fff' }}>{t.nav.betting}</Link></li>
                  {user && <li><Link className="dropdown-item" to="/my-bets" style={{ color: '#fff' }}>{t.nav.myBets}</Link></li>}
                  {user && <li><Link className="dropdown-item" to="/score-predictions" style={{ color: '#fff' }}>{t.nav.scorePredictions}</Link></li>}
                  <li><Link className="dropdown-item" to="/leaderboard" style={{ color: '#fff' }}>{t.nav.leaderboard}</Link></li>
                </ul>
              </li>
              <li className="nav-item">
                <button className="btn btn-sm" onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')} style={{ background: '#ccc', color: '#000', margin: '0.5rem' }}>
                  {language === 'en' ? 'FR' : 'EN'}
                </button>
              </li>
              <li className="nav-item"><Link className="nav-link" to="/admin">{t.nav.admin}</Link></li>
              {user ? (
                <>
                  <li className="nav-item"><Link className="nav-link" to="/profile">{profile?.display_name}</Link></li>
                  <li className="nav-item"><button className="btn btn-sm" onClick={signOut} style={{ background: '#a8d5ff', color: '#000', margin: '0.5rem' }}>{t.nav.signOut}</button></li>
                </>
              ) : (
                <li className="nav-item"><Link className="nav-link" to="/auth">{t.nav.signIn}</Link></li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<News />} />
          <Route path="/divisions" element={<Divisions />} />
          <Route path="/teams" element={<TeamStats />} />
          <Route path="/players" element={<PlayerStats />} />
          <Route path="/betting" element={<Betting />} />
          <Route path="/my-bets" element={<MyBets />} />
          <Route path="/score-predictions" element={<ScorePredictions />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
