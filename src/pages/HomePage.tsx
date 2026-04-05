import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCardStore } from '../store/useCardStore';
import { useStreakStore } from '../store/useStreakStore';
import { ImportScreen } from '../components/ImportScreen';
import { StreakBanner } from '../components/StreakBanner';
import { WordOfDay } from '../components/WordOfDay';
import { DailyGoalProgress } from '../components/DailyGoalProgress';
import type { ExportData } from '../lib/types';
import { migrateData } from '../lib/migration';
import { useAuthStore } from '../store/useAuthStore';
import { handleAuthCallback, authenticateWithAPI, syncPull } from '../lib/api';

export function HomePage() {
  const navigate = useNavigate();
  const [importExpanded, setImportExpanded] = useState(false);
  const { words, dueCount, addWords } = useCardStore();
  const { mergeStudyDays } = useStreakStore();

  const handleImport = useCallback((data: ExportData) => {
    if (!data.words.length) return;
    const migrated = migrateData(data);
    const v2Words = migrated.words;

    addWords(v2Words);
  }, [addWords]);

  const handleStudyNow = useCallback(() => {
    navigate('/study');
  }, [navigate]);

  useEffect(() => {
    const cb = handleAuthCallback();
    if (cb) {
      authenticateWithAPI(cb.token)
        .then((u) => {
          useAuthStore.getState().login(cb.token, u);
          return syncPull();
        })
        .then((serverData) => {
          const migrated = migrateData(serverData);
          const v2Words = migrated.words;
          addWords(v2Words);
          if (migrated.studyDays) {
            mergeStudyDays(migrated.studyDays);
          }
        })
        .catch(console.error);
    }
  }, [addWords, mergeStudyDays]);

  const hasData = words.length > 0;

  return (
    <div className="home-page">
      <StreakBanner />

      {hasData && (
        <>
          {dueCount > 0 ? (
            <div className="due-section">
              <p className="due-count">{dueCount} cards due</p>
              <button type="button" className="btn-primary" onClick={handleStudyNow}>
                Study Now
              </button>
            </div>
          ) : (
            <p className="all-done">All caught up! No cards due.</p>
          )}

          <DailyGoalProgress />
          <WordOfDay />
        </>
      )}

      <details className="import-details" open={importExpanded} onToggle={(e) => setImportExpanded((e.currentTarget as HTMLDetailsElement).open)}>
        <summary className="import-summary">{hasData ? 'Import new words' : 'Import words to get started'}</summary>
        <ImportScreen
          onImport={handleImport}
          hasData={hasData}
          dueCount={dueCount}
          onStudy={handleStudyNow}
        />
      </details>
    </div>
  );
}
