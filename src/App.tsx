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
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';

function Navigation() {
  const { user, profile, signOut } = useAuth();

  return (
    <nav>
      <ul style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <li><Link to="/">Home</Link></li>
          <li className="dropdown">
            <span>Stats ▾</span>
            <ul className="dropdown-menu">
              <li><Link to="/divisions">Divisions</Link></li>
              <li><Link to="/teams">Team Stats</Link></li>
              <li><Link to="/players">Player Stats</Link></li>
            </ul>
          </li>
          <li className="dropdown">
            <span>Gamba ▾</span>
            <ul className="dropdown-menu">
              <li><Link to="/betting">Betting</Link></li>
              {user && <li><Link to="/my-bets">My Bets</Link></li>}
            </ul>
          </li>
          <li><Link to="/leaderboard">Leaderboard</Link></li>
          {user ? (
            <li><Link to="/profile">{profile?.display_name}</Link></li>
          ) : (
            <li><Link to="/auth">Sign In</Link></li>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <li><Link to="/admin">Admin</Link></li>
          {user && <li><button onClick={signOut} style={{ padding: '0.5rem 1rem' }}>Sign Out</button></li>}
        </div>
      </ul>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/divisions" element={<Divisions />} />
          <Route path="/teams" element={<TeamStats />} />
          <Route path="/players" element={<PlayerStats />} />
          <Route path="/betting" element={<Betting />} />
          <Route path="/my-bets" element={<MyBets />} />
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
