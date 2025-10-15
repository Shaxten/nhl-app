function Home() {
  return (
    <div className="container">
      <h1>Hockey Stats Tracker</h1>
      <p style={{ fontSize: '1.2rem', marginTop: '2rem', lineHeight: '1.8' }}>
        Welcome to the Hockey Stats Tracker! This application provides comprehensive statistics 
        for hockey teams and players across all four divisions.
      </p>
      <div style={{ marginTop: '3rem' }}>
        <h2>Features</h2>
        <ul style={{ fontSize: '1.1rem', marginTop: '1rem', lineHeight: '2' }}>
          <li>View division standings and team points</li>
          <li>Explore detailed team statistics including wins, losses, and ties</li>
          <li>Browse player rosters and individual performance metrics</li>
          <li>Track top 20 players by points, goals, and assists</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;
