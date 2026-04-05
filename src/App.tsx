import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { TabBar } from './components/TabBar';
import { HomePage } from './pages/HomePage';
import { StudyPage } from './pages/StudyPage';
import { SummaryPage } from './pages/SummaryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useStreakStore } from './store/useStreakStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useCardStore } from './store/useCardStore';
import { useAuthStore } from './store/useAuthStore';

import { migrateData } from './lib/migration';
import { handleAuthCallback, authenticateWithAPI, syncPull } from './lib/api';

function App() {
  useStreakStore();
  const { darkMode } = useSettingsStore();
  const { setWords, addWords } = useCardStore();
  const { login } = useAuthStore();

  useEffect(() => {
    const savedData = localStorage.getItem('dicfr-cards-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.version === 2 && Array.isArray(parsed.words)) {
          setWords(parsed.words);
        } else if (parsed.version === 1 && Array.isArray(parsed.words)) {
          const migrated = migrateData(parsed);
          setWords(migrated.words);
        }
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    }
  }, [setWords]);

  useEffect(() => {
    const applyDarkMode = () => {
      if (darkMode === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-theme', darkMode);
      }
    };

    applyDarkMode();

    if (darkMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyDarkMode);
      return () => mediaQuery.removeEventListener('change', applyDarkMode);
    }
  }, [darkMode]);

  useEffect(() => {
    const cb = handleAuthCallback();
    if (cb) {
      authenticateWithAPI(cb.token)
        .then((u) => {
          login(cb.token, u);
          return syncPull();
        })
        .then((serverData) => {
          const migrated = migrateData(serverData);
          addWords(migrated.words);
          if (migrated.studyDays) {
            useStreakStore.getState().mergeStudyDays(migrated.studyDays);
          }
        })
        .catch(console.error);
    }
  }, [login, addWords]);

  return (
    <div className="app">
      <BrowserRouter>
        <AppHeader />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/study" element={<StudyPage />} />
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
        <TabBar />
      </BrowserRouter>
    </div>
  );
}

function AppHeader() {
  const location = useLocation();
  const { currentStreak } = useStreakStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const isHome = location.pathname === '/';

  return (
    <header className="app-header">
      <span className="app-title">dicfr cards</span>
      <div className="header-actions">
        {!isHome && currentStreak > 0 && (
          <span className="streak-badge">
            🔥 {currentStreak}
          </span>
        )}
        {isAuthenticated && user ? (
          <>
            <button type="button" className="nav-btn" onClick={logout}>
              Sign out
            </button>
          </>
        ) : (
          <span />
        )}
      </div>
    </header>
  );
}

export default App;
