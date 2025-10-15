import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Divisions from './pages/Divisions';
import TeamStats from './pages/TeamStats';
import PlayerStats from './pages/PlayerStats';

function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/divisions">Divisions</Link></li>
          <li><Link to="/teams">Team Stats</Link></li>
          <li><Link to="/players">Player Stats</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/divisions" element={<Divisions />} />
        <Route path="/teams" element={<TeamStats />} />
        <Route path="/players" element={<PlayerStats />} />
      </Routes>
    </Router>
  );
}

export default App;
