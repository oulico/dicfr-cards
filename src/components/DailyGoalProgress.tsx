import { useMemo } from 'react';
import { useStreakStore } from '../store/useStreakStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { getLocalDate } from '../lib/streak';

export function DailyGoalProgress() {
  const { studyDays } = useStreakStore();
  const { dailyGoal } = useSettingsStore();

  const today = getLocalDate();
  const todayStudy = useMemo(() => {
    return studyDays.find((d) => d.date === today);
  }, [studyDays, today]);

  const progress = useMemo(() => {
    if (!todayStudy) return 0;
    return Math.min(100, (todayStudy.cardsReviewed / dailyGoal) * 100);
  }, [todayStudy, dailyGoal]);

  if (!todayStudy && progress === 0) return null;

  const goalReached = todayStudy && todayStudy.cardsReviewed >= dailyGoal;

  return (
    <div className="daily-goal-progress">
      <div className="goal-header">
        <span className="goal-text">
          {todayStudy ? `${todayStudy.cardsReviewed} / ${dailyGoal} cards today` : `0 / ${dailyGoal} cards today`}
        </span>
        {goalReached && <span className="goal-reached">Goal reached! 🎉</span>}
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${progress}%`,
            backgroundColor: goalReached ? 'var(--color-success)' : 'var(--color-primary)',
          }}
        />
      </div>
    </div>
  );
}
