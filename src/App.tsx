import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="desktop-nav">
        <ul style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/news">News</Link></li>
            <li className="dropdown">
              <span><Link to="/players">Stats ▾</Link></span>
              <ul className="dropdown-menu">
                <li><Link to="/divisions">Divisions</Link></li>
                <li><Link to="/teams">Team Stats</Link></li>
                <li><Link to="/players">Player Stats</Link></li>
              </ul>
            </li>
            <li className="dropdown">
             <span><Link to="/betting">Betting ▾</Link></span>
              <ul className="dropdown-menu">
                {user && <li><Link to="/my-bets">My Bets</Link></li>}
                {user && <li><Link to="/score-predictions">Score Predictions</Link></li>}
                <li><Link to="/leaderboard">Leaderboard</Link></li>
              </ul>
            </li>     
            {user ? (
              <li><Link to="/profile">{profile?.display_name}</Link></li>
            ) : (
              <li><Link to="/auth">Sign In</Link></li>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <li><Link to="/admin">Admin</Link></li>
            {user && <li><button onClick={signOut} style={{ padding: '0.5rem 1rem' }}>Sign Out</button></li>}
          </div>
        </ul>
      </nav>

      {/* Mobile Bootstrap Navbar */}
      <nav className="navbar navbar-expand-xl navbar-dark mobile-nav" style={{ background: '#1a1a1a', borderBottom: '1px solid #333' }}>
        <div className="container-fluid">
          <Link className="navbar-brand" to="/" style={{ color: '#f6e4ad' }}>Hockey Stats</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/news">News</Link></li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Stats</a>
                <ul className="dropdown-menu" style={{ background: '#1a1a1a' }}>
                  <li><Link className="dropdown-item" to="/divisions" style={{ color: '#fff' }}>Divisions</Link></li>
                  <li><Link className="dropdown-item" to="/teams" style={{ color: '#fff' }}>Team Stats</Link></li>
                  <li><Link className="dropdown-item" to="/players" style={{ color: '#fff' }}>Player Stats</Link></li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">Betting</a>
                <ul className="dropdown-menu" style={{ background: '#1a1a1a' }}>
                  <li><Link className="dropdown-item" to="/betting" style={{ color: '#fff' }}>Betting</Link></li>
                  {user && <li><Link className="dropdown-item" to="/my-bets" style={{ color: '#fff' }}>My Bets</Link></li>}
                  {user && <li><Link className="dropdown-item" to="/score-predictions" style={{ color: '#fff' }}>Score Predictions</Link></li>}
                  <li><Link className="dropdown-item" to="/leaderboard" style={{ color: '#fff' }}>Leaderboard</Link></li>
                </ul>
              </li>
              <li className="nav-item"><Link className="nav-link" to="/admin">Admin</Link></li>
              {user ? (
                <>
                  <li className="nav-item"><Link className="nav-link" to="/profile">{profile?.display_name}</Link></li>
                  <li className="nav-item"><button className="btn btn-sm" onClick={signOut} style={{ background: '#f6e4ad', color: '#000', margin: '0.5rem' }}>Sign Out</button></li>
                </>
              ) : (
                <li className="nav-item"><Link className="nav-link" to="/auth">Sign In</Link></li>
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
    </AuthProvider>
  );
}

export default App;
