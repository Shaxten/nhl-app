import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Divisions from './pages/Divisions';
import TeamStats from './pages/TeamStats';
import PlayerStats from './pages/PlayerStats';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Betting from './pages/Betting';
import Leaderboard from './pages/Leaderboard';

function Navigation() {
  const { user, profile, signOut } = useAuth();

  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/divisions">Divisions</Link></li>
        <li><Link to="/teams">Team Stats</Link></li>
        <li><Link to="/players">Player Stats</Link></li>
        <li><Link to="/betting">Betting</Link></li>
        <li><Link to="/leaderboard">Leaderboard</Link></li>
        {user ? (
          <>
            <li><Link to="/profile">{profile?.display_name}</Link></li>
            <li><button onClick={signOut} style={{ padding: '0.5rem 1rem' }}>Sign Out</button></li>
          </>
        ) : (
          <li><Link to="/auth">Sign In</Link></li>
        )}
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
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
