import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Home from './pages/Home';
import Divisions from './pages/Divisions';
import TeamStats from './pages/TeamStats';
import PlayerStats from './pages/PlayerStats';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Betting from './pages/Betting';
import BetParlay from './pages/BetParlay';
import MyBets from './pages/MyBets';
import ScorePredictions from './pages/ScorePredictions';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import News from './pages/News';
import Transactions from './pages/Transactions';
import Injuries from './pages/Injuries';

function Navigation() {
  const { user, profile, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="desktop-nav">
        <ul style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <li><Link to="/">{t.nav.home}</Link></li>
            <li className="dropdown">
              <span><Link to="/news">{t.nav.news} ▾</Link></span>
              <ul className="dropdown-menu">
                <li><Link to="/news">{t.nav.latestNews}</Link></li>
                <li><Link to="/transactions">{language === 'fr' ? 'Transactions' : 'Transactions'}</Link></li>
                <li><Link to="/injuries">{language === 'fr' ? 'Blessures' : 'Injuries'}</Link></li>
              </ul>
            </li>
            <li className="dropdown">
              <span><Link to="/divisions">{t.nav.stats} ▾</Link></span>
              <ul className="dropdown-menu">
                <li><Link to="/divisions">{t.nav.divisions}</Link></li>
                <li><Link to="/teams">{t.nav.teamStats}</Link></li>
                <li><Link to="/players">{t.nav.playerStats}</Link></li>
              </ul>
            </li>
            <li className="dropdown">
             <span><Link to="/betting">{t.nav.betting} ▾</Link></span>
              <ul className="dropdown-menu">
                {user && <li><Link to="/betting">{t.nav.gambling}</Link></li>}
                {user && <li><Link to="/bet-parlay">{language === 'fr' ? 'Faites un parlay' : 'Do a Parlay'}</Link></li>}
                <li><Link to="/leaderboard">{t.nav.leaderboard}</Link></li>
              </ul>
            </li>     
            {user ? (
              <li className="dropdown">
                <span><Link to="/my-bets">{profile?.display_name} ▾</Link></span>
                <ul className="dropdown-menu">
                  <li><Link to="/my-bets">{t.nav.myBets}</Link></li>
                  <li><Link to="/score-predictions">{t.nav.scorePredictions}</Link></li>
                  <li><Link to="/profile">{t.profile.title}</Link></li>
                  <li><Link to="/change-password">{language === 'fr' ? 'Changer mot de passe' : 'Change Password'}</Link></li>
                </ul>
              </li>
            ) : (
              <li><Link to="/auth">{t.nav.signIn}</Link></li>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <li>
              <button onClick={toggleTheme} style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--accent)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {theme === 'dark' ? '☀️' : theme === 'light' ? '🌙' : theme === 'habs' ? <img src="https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/mtl.png&h=30&w=30" alt="MTL" style={{ width: '20px', height: '20px' }} /> : <img src="https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/la.png&h=30&w=30" alt="LA" style={{ width: '20px', height: '20px' }} />}
              </button>
            </li>
            <li>
              <button onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')} style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--accent)', border: 'none', cursor: 'pointer' }}>
                {language === 'en' ? 'FR' : 'EN'}
              </button>
            </li>
            {(profile?.display_name === 'Po' || profile?.display_name === 'Nikita') && (
              <li><Link to="/admin">{t.nav.admin}</Link></li>
            )}
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
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">{t.nav.news}</a>
                <ul className="dropdown-menu" style={{ background: '#1a1a1a' }}>
                  <li><Link className="dropdown-item" to="/news" style={{ color: '#fff' }}>{t.nav.latestNews}</Link></li>
                  <li><Link className="dropdown-item" to="/transactions" style={{ color: '#fff' }}>{language === 'fr' ? 'Transactions' : 'Transactions'}</Link></li>
                  <li><Link className="dropdown-item" to="/injuries" style={{ color: '#fff' }}>{language === 'fr' ? 'Blessures' : 'Injuries'}</Link></li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">{t.nav.stats}</a>
                <ul className="dropdown-menu" style={{ background: '#1a1a1a' }}>
                  <li><Link className="dropdown-item" to="/divisions" style={{ color: '#fff' }}>{t.nav.divisions}</Link></li>
                  <li><Link className="dropdown-item" to="/teams" style={{ color: '#fff' }}>{t.nav.teamStats}</Link></li>
                  <li><Link className="dropdown-item" to="/players" style={{ color: '#fff' }}>{t.nav.playerStats}</Link></li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">{language === 'fr' ? 'Placez vos bets' : 'Place Your Bets'}</a>
                <ul className="dropdown-menu" style={{ background: '#1a1a1a' }}>
                  <li><Link className="dropdown-item" to="/betting" style={{ color: '#fff' }}>{language === 'fr' ? 'Placez vos bets' : 'Place Your Bets'}</Link></li>
                  {user && <li><Link className="dropdown-item" to="/bet-parlay" style={{ color: '#fff' }}>{language === 'fr' ? 'Faites un parlay' : 'Do a Parlay'}</Link></li>}
                  <li><Link className="dropdown-item" to="/leaderboard" style={{ color: '#fff' }}>{t.nav.leaderboard}</Link></li>
                </ul>
              </li>
              <li className="nav-item">
                <button className="btn btn-sm" onClick={toggleTheme} style={{ background: 'var(--accent)', color: 'var(--bg-primary)', margin: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {theme === 'dark' ? '☀️' : theme === 'light' ? '🌙' : theme === 'habs' ? <img src="https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/mtl.png&h=30&w=30" alt="MTL" style={{ width: '20px', height: '20px' }} /> : <img src="https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/la.png&h=30&w=30" alt="LA" style={{ width: '20px', height: '20px' }} />}
                </button>
              </li>
              <li className="nav-item">
                <button className="btn btn-sm" onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')} style={{ background: 'var(--accent)', color: 'var(--bg-primary)', margin: '0.5rem' }}>
                  {language === 'en' ? 'FR' : 'EN'}
                </button>
              </li>
              {(profile?.display_name === 'Po' || profile?.display_name === 'Nikita') && (
                <li className="nav-item"><Link className="nav-link" to="/admin">{t.nav.admin}</Link></li>
              )}
              {user ? (
                <>
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">{profile?.display_name}</a>
                    <ul className="dropdown-menu" style={{ background: '#1a1a1a' }}>
                      <li><Link className="dropdown-item" to="/my-bets" style={{ color: '#fff' }}>{t.nav.myBets}</Link></li>
                      <li><Link className="dropdown-item" to="/score-predictions" style={{ color: '#fff' }}>{t.nav.scorePredictions}</Link></li>
                      <li><Link className="dropdown-item" to="/profile" style={{ color: '#fff' }}>{t.profile.title}</Link></li>
                      <li><Link className="dropdown-item" to="/change-password" style={{ color: '#fff' }}>{language === 'fr' ? 'Changer mot de passe' : 'Change Password'}</Link></li>
                    </ul>
                  </li>
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
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<News />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/injuries" element={<Injuries />} />
          <Route path="/divisions" element={<Divisions />} />
          <Route path="/teams" element={<TeamStats />} />
          <Route path="/players" element={<PlayerStats />} />
          <Route path="/betting" element={<Betting />} />
          <Route path="/bet-parlay" element={<BetParlay />} />
          <Route path="/my-bets" element={<MyBets />} />
          <Route path="/score-predictions" element={<ScorePredictions />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Routes>
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
