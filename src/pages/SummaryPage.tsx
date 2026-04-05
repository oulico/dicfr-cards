import { useNavigate, useLocation } from 'react-router-dom';
import type { Grade } from 'ts-fsrs';

interface SessionResult {
  total: number;
  correct: number;
  grades: Grade[];
  startTime: Date;
  endTime: Date;
}

export function SummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state as SessionResult | null;

  const handleStudyAgain = () => {
    navigate('/study');
  };

  const handleHome = () => {
    navigate('/');
  };

  if (!result) {
    return (
      <div className="summary-page">
        <p>No session data found. Start a new study session.</p>
        <button type="button" className="btn-primary" onClick={handleStudyAgain}>
          Study Now
        </button>
      </div>
    );
  }

  const pct = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0;
  const minutes = Math.round((result.endTime.getTime() - result.startTime.getTime()) / 60000);
  return (
    <div className="summary-page">
      <h2 className="summary-title">Session Complete</h2>

      <div className="stats-grid">
        <div className="stat">
          <span className="stat-value">{result.total}</span>
          <span className="stat-label">cards reviewed</span>
        </div>
        <div className="stat">
          <span className="stat-value">{pct}%</span>
          <span className="stat-label">accuracy</span>
        </div>
        <div className="stat">
          <span className="stat-value">{minutes}</span>
          <span className="stat-label">minutes</span>
        </div>
      </div>

      <div className="summary-actions">
        <button type="button" className="btn-primary" onClick={handleStudyAgain}>
          Study Again
        </button>
        <button type="button" className="btn-secondary" onClick={handleHome}>
          Home
        </button>
      </div>
    </div>
  );
}
