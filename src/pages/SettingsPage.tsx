import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useClassroomStore } from '../store/useClassroomStore';

import { useCardStore } from '../store/useCardStore';
import { startGoogleLogin, syncPush, syncPull, getStoredAuth } from '../lib/api';

export function SettingsPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { darkMode, dailyGoal, dailyGoalType, notificationsEnabled, setDarkMode, setDailyGoal, setDailyGoalType, setNotificationsEnabled } = useSettingsStore();
  const { classrooms, fetchClassrooms, joinClassroom, createClassroom } = useClassroomStore();
  const { words } = useCardStore();
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [joining, setJoining] = useState(false);

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

  useEffect(() => {
    if (isAuthenticated) {
      const auth = getStoredAuth();
      if (auth) {
        fetchClassrooms(auth.token);
      }
    }
  }, [isAuthenticated, fetchClassrooms]);

  const handleJoinClassroom = async () => {
    if (!inviteCodeInput.trim() || !isAuthenticated) return;

    setJoining(true);
    try {
      const auth = getStoredAuth();
      if (auth) {
        await joinClassroom(auth.token, inviteCodeInput.trim());
        setInviteCodeInput('');
      }
    } catch (error) {
      console.error('Failed to join classroom:', error);
      alert('Failed to join classroom. Please check the invite code and try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleCreateClassroom = async () => {
    if (!isAuthenticated) return;

    const name = prompt('Enter classroom name:');
    if (name && name.trim()) {
      try {
        const auth = getStoredAuth();
        if (auth) {
          await createClassroom(auth.token, name.trim());
        }
      } catch (error) {
        console.error('Failed to create classroom:', error);
        alert('Failed to create classroom. Please try again.');
      }
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

      {isAuthenticated && (
        <section className="settings-section">
          <h3 className="section-title">Classroom</h3>
          <div className="setting-row">
            <label htmlFor="invite-code" className="setting-label">
              Join Classroom
            </label>
            <input
              id="invite-code"
              type="text"
              className="setting-input"
              placeholder="Invite code"
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value)}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={handleJoinClassroom}
              disabled={joining || !inviteCodeInput.trim()}
            >
              {joining ? 'Joining...' : 'Join'}
            </button>
          </div>
          <div className="setting-row">
            <span className="setting-label">Create Classroom</span>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCreateClassroom}
            >
              Create
            </button>
          </div>
          {classrooms.length > 0 && (
            <div className="classroom-list">
              {classrooms.map((classroom) => (
                <div key={classroom.id} className="classroom-item">
                  <div className="classroom-name">{classroom.name}</div>
                  <span className={`classroom-role ${classroom.role}`}>
                    {classroom.role === 'teacher' ? 'Teacher' : 'Student'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

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
        <div className="setting-row">
          <span className="setting-label">Daily Reminder</span>
          <div className="setting-toggle">
            <button
              type="button"
              className={`toggle-option ${!notificationsEnabled ? 'active' : ''}`}
              onClick={() => {
                setNotificationsEnabled(false);
                (async () => {
                  const { cancelDailyReminder } = await import('../lib/notifications');
                  await cancelDailyReminder();
                })();
              }}
            >
              Off
            </button>
            <button
              type="button"
              className={`toggle-option ${notificationsEnabled ? 'active' : ''}`}
              onClick={async () => {
                setNotificationsEnabled(true);
                const { requestNotificationPermission, scheduleDailyReminder } = await import('../lib/notifications');
                const granted = await requestNotificationPermission();
                if (granted) {
                  await scheduleDailyReminder();
                } else {
                  alert('Notification permission denied. Please enable notifications in your device settings.');
                }
              }}
            >
              On
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
