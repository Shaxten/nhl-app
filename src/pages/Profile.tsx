import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

function Profile() {
  const { profile, updateDisplayName, refreshProfile } = useAuth();
  const { t, language } = useLanguage();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [editing, setEditing] = useState(false);

  async function handleUpdate() {
    await updateDisplayName(displayName);
    setEditing(false);
  }

  if (!profile) {
    return (
      <div className="container">
        <h1>{t.common.loading}</h1>
        <p>If this persists, try signing out and back in.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>{t.profile.title}</h1>
      <button onClick={refreshProfile} style={{ marginTop: '1rem' }}>
        {language === 'fr' ? 'Actualiser' : 'Refresh Stats'}
      </button>
      <div className="team-stats" style={{ marginTop: '2rem' }}>
        <div className="stats-summary">
          <div className="stat-box">
            <h3>{profile.currency} MC</h3>
            <p>{t.profile.currency}</p>
          </div>
          <div className="stat-box">
            <h3 style={{ color: '#4ade80' }}>{profile.bets_won || 0}</h3>
            <p>{language === 'fr' ? 'Bets gagnés' : 'Bets Won'}</p>
          </div>
          <div className="stat-box">
            <h3 style={{ color: '#ff4a4a' }}>{profile.bets_lost || 0}</h3>
            <p>{language === 'fr' ? 'Bets perdus' : 'Bets Lost'}</p>
          </div>
          <div className="stat-box">
                      <h3 style={{ color: (profile.total_winnings || 0) >= 0 ? '#4ade80' : '#ff4a4a' }}>
              {(profile.total_winnings || 0) >= 0 ? '+ ' : (profile.total_winnings || 0) < 0 ? '- ' : ''}{Math.abs(profile.total_winnings || 0)}
            </h3>
            <p>{language === 'fr' ? 'Gains totaux' : 'Total Winnings'}</p>
          </div>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <h3>{t.profile.displayName}</h3>
          {editing ? (
            <div style={{ marginTop: '1rem' }}>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{ padding: '0.5rem', marginRight: '1rem' }}
              />
              <button onClick={handleUpdate}>{t.scorePredictions.save}</button>
              <button onClick={() => setEditing(false)} style={{ marginLeft: '0.5rem', background: '#252b4a' }}>
                {t.scorePredictions.cancel}
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              <p className="profile-display-name">{profile.display_name}</p>
              <button onClick={() => setEditing(true)} style={{ marginTop: '1rem' }}>
                {language === 'fr' ? 'Changer le nom' : 'Edit Name'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
