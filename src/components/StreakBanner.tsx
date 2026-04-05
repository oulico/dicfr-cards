import { useEffect, useState } from 'react';
import { useStreakStore } from '../store/useStreakStore';

const MILESTONES = [7, 30, 100];

export function StreakBanner() {
  const { currentStreak, freezeAvailable } = useStreakStore();
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [freezeUsed, setFreezeUsed] = useState(false);

  useEffect(() => {
    if (MILESTONES.includes(currentStreak)) {
      setShouldAnimate(true);
      setTimeout(() => setShouldAnimate(false), 300);
    }
  }, [currentStreak]);

  useEffect(() => {
    if (freezeUsed) {
      setTimeout(() => setFreezeUsed(false), 3000);
    }
  }, [freezeUsed]);

  if (currentStreak === 0) {
    return (
      <div className="streak-banner">
        <span className="streak-text">Start your streak today!</span>
      </div>
    );
  }

  return (
    <div className={`streak-banner ${shouldAnimate ? 'animate' : ''}`}>
      <span className="streak-icon">🔥</span>
      <span className="streak-count">{currentStreak}</span>
      {freezeAvailable && <span className="freeze-badge">🛡️</span>}
      {freezeUsed && <span className="freeze-used">(saved!)</span>}

    </div>
  );
}
