import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { changePassword } from '../utils/changePassword';

function Profile() {
  const { profile, updateDisplayName, refreshProfile } = useAuth();
  const { t, language } = useLanguage();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [editing, setEditing] = useState(false);
  const [nameError, setNameError] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  async function handleUpdate() {
    try {
      setNameError('');
      await updateDisplayName(displayName);
      setEditing(false);
    } catch (err: any) {
      setNameError(err.message);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError(language === 'fr' ? 'Les nouveaux mots de passe ne correspondent pas' : 'New passwords do not match');
      return;
    }

    try {
      await changePassword(oldPassword, newPassword);
      setPasswordSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message);
    }
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
        {language === 'fr' ? 'Actualiser' : 'Refresh'}
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
              <button onClick={() => { setEditing(false); setNameError(''); }} style={{ marginLeft: '0.5rem', background: '#252b4a' }}>
                {t.scorePredictions.cancel}
              </button>
              {nameError && <div style={{ color: '#ff4a4a', marginTop: '0.5rem' }}>{nameError}</div>}
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
        <div style={{ marginTop: '2rem' }}>
          <h3>{language === 'fr' ? 'Changer le mot de passe' : 'Change Password'}</h3>
          <form onSubmit={handlePasswordChange} style={{ marginTop: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                {language === 'fr' ? 'Ancien mot de passe' : 'Old Password'}
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                style={{ padding: '0.5rem', width: '100%', maxWidth: '300px' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                {language === 'fr' ? 'Nouveau mot de passe (max 25 caractères)' : 'New Password (max 25 characters)'}
              </label>
              <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: '300px' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  maxLength={25}
                  style={{ padding: '0.5rem', width: '100%', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  {showNewPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                {language === 'fr' ? 'Confirmer le nouveau mot de passe' : 'Confirm New Password'}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                maxLength={25}
                style={{ padding: '0.5rem', width: '100%', maxWidth: '300px' }}
              />
            </div>
            {passwordError && <div style={{ color: '#ff4a4a', marginBottom: '1rem' }}>{passwordError}</div>}
            {passwordSuccess && <div style={{ color: '#4ade80', marginBottom: '1rem' }}>{language === 'fr' ? 'Mot de passe changé avec succès!' : 'Password changed successfully!'}</div>}
            <button type="submit">{language === 'fr' ? 'Changer le mot de passe' : 'Change Password'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
