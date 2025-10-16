import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Profile() {
  const { profile, updateDisplayName, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [editing, setEditing] = useState(false);

  async function handleUpdate() {
    await updateDisplayName(displayName);
    setEditing(false);
  }

  if (!profile) {
    return (
      <div className="container">
        <h1>Loading...</h1>
        <p>If this persists, try signing out and back in.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Profile</h1>
      <button onClick={refreshProfile} style={{ marginTop: '1rem' }}>
        Refresh Stats
      </button>
      <div className="team-stats" style={{ marginTop: '2rem' }}>
        <div className="stats-summary">
          <div className="stat-box">
            <h3>{profile.currency}</h3>
            <p>Currency</p>
          </div>
          <div className="stat-box">
            <h3>{profile.bets_won || 0}</h3>
            <p>Bets Won</p>
          </div>
          <div className="stat-box">
            <h3>{profile.bets_lost || 0}</h3>
            <p>Bets Lost</p>
          </div>
          <div className="stat-box">
            <h3 style={{ color: (profile.total_winnings || 0) >= 0 ? '#4a9eff' : '#ff4a4a' }}>
              {(profile.total_winnings || 0) >= 0 ? '+' : ''}{profile.total_winnings || 0}
            </h3>
            <p>Total Winnings</p>
          </div>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <h3>Display Name</h3>
          {editing ? (
            <div style={{ marginTop: '1rem' }}>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{ padding: '0.5rem', marginRight: '1rem' }}
              />
              <button onClick={handleUpdate}>Save</button>
              <button onClick={() => setEditing(false)} style={{ marginLeft: '0.5rem', background: '#252b4a' }}>
                Cancel
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '1.2rem' }}>{profile.display_name}</p>
              <button onClick={() => setEditing(true)} style={{ marginTop: '1rem' }}>
                Edit Name
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
