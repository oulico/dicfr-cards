import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';

import { useCardStore } from '../store/useCardStore';
import { startGoogleLogin, syncPush, syncPull } from '../lib/api';

export function SettingsPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { darkMode, dailyGoal, dailyGoalType, setDarkMode, setDailyGoal, setDailyGoalType } = useSettingsStore();
  const { words } = useCardStore();

  const handleSignIn = () => {
    startGoogleLogin();
  };

  const handleSignOut = () => {
    logout();
  };

  const handleSync = async () => {
    if (!isAuthenticated) return;

    try {
      await syncPush(words);
      await syncPull();
      console.log('Synced successfully');
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return (
    <div className="settings-page">
      <h2 className="page-title">Settings</h2>

      <section className="settings-section">
        <h3 className="section-title">Account</h3>
        {isAuthenticated && user ? (
          <div className="account-info">
            <p className="account-email">{user.email}</p>
            <div className="account-actions">
              <button type="button" className="btn-secondary" onClick={handleSync}>
                Sync Now
              </button>
              <button type="button" className="btn-secondary" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn-primary" onClick={handleSignIn}>
            Sign In with Google
          </button>
        )}
      </section>

      <section className="settings-section">
        <h3 className="section-title">Study Preferences</h3>
        <div className="setting-row">
          <label htmlFor="daily-goal" className="setting-label">
            Daily Goal
          </label>
          <input
            id="daily-goal"
            type="number"
            className="setting-input"
            min="1"
            max="100"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(parseInt(e.target.value, 10) || 10)}
          />
          <span className="setting-unit">
            {dailyGoalType === 'cards' ? 'cards' : 'minutes'}
          </span>
        </div>
        <div className="setting-row">
          <span className="setting-label">Goal Type</span>
          <div className="setting-toggle">
            <button
              type="button"
              className={`toggle-option ${dailyGoalType === 'cards' ? 'active' : ''}`}
              onClick={() => setDailyGoalType('cards')}
            >
              Cards
            </button>
            <button
              type="button"
              className={`toggle-option ${dailyGoalType === 'minutes' ? 'active' : ''}`}
              onClick={() => setDailyGoalType('minutes')}
            >
              Minutes
            </button>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h3 className="section-title">Appearance</h3>
        <div className="setting-row">
          <span className="setting-label">Dark Mode</span>
          <div className="setting-toggle">
            <button
              type="button"
              className={`toggle-option ${darkMode === 'light' ? 'active' : ''}`}
              onClick={() => setDarkMode('light')}
            >
              Light
            </button>
            <button
              type="button"
              className={`toggle-option ${darkMode === 'system' ? 'active' : ''}`}
              onClick={() => setDarkMode('system')}
            >
              System
            </button>
            <button
              type="button"
              className={`toggle-option ${darkMode === 'dark' ? 'active' : ''}`}
              onClick={() => setDarkMode('dark')}
            >
              Dark
            </button>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h3 className="section-title">About</h3>
        <p className="about-text">
          dicfr cards v2.0 — French vocabulary flashcards with spaced repetition.
        </p>
      </section>
    </div>
  );
}
