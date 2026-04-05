import { useMemo, useEffect } from 'react';
import { useCardStore } from '../store/useCardStore';
import { useStreakStore } from '../store/useStreakStore';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ExportReportProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportReport({ isOpen, onClose }: ExportReportProps) {
  const { words, reviewLogs } = useCardStore();
  const { studyDays, currentStreak } = useStreakStore();

  useEffect(() => {
    const handlePrint = () => {
      if (isOpen) {
        window.print();
      }
    };

    if (isOpen) {
      window.addEventListener('afterprint', onClose);
      setTimeout(handlePrint, 100);
      return () => {
        window.removeEventListener('afterprint', onClose);
      };
    }
  }, [isOpen, onClose]);

  const insights = useMemo(() => {
    if (words.length === 0) return [];

    const learningCards = words.filter((w) => w.fsrsCard.state === 2).length;
    const reviewingCards = words.filter((w) => w.fsrsCard.state === 1).length;
    const newCards = words.filter((w) => w.fsrsCard.state === 0).length;

    const recentCorrect = reviewLogs.slice(0, 20).filter((log) => log.rating >= 3).length;
    const recentAccuracy = reviewLogs.slice(0, 20).length > 0
      ? Math.round((recentCorrect / Math.min(reviewLogs.length, 20)) * 100)
      : 0;

    return [
      { label: 'Current Streak', value: `${currentStreak} days` },
      { label: 'Learning Cards', value: learningCards.toString() },
      { label: 'Reviewing Cards', value: reviewingCards.toString() },
      { label: 'New Cards', value: newCards.toString() },
      { label: 'Recent Accuracy', value: `${recentAccuracy}%` },
    ];
  }, [words, reviewLogs, currentStreak]);

  const retentionData = useMemo(() => {
    const last30Days = studyDays.slice(-30);
    return last30Days.map((day) => ({
      date: day.date.slice(5),
      accuracy: day.cardsReviewed > 0 ? Math.round((day.correctCount / day.cardsReviewed) * 100) : 0,
    }));
  }, [studyDays]);

  const posData = useMemo(() => {
    const posMap = new Map<string, number>();
    words.forEach((w) => {
      if (w.pos) {
        posMap.set(w.pos, (posMap.get(w.pos) || 0) + 1);
      }
    });
    return Array.from(posMap.entries()).map(([name, value]) => ({ name, value }));
  }, [words]);

  const strongestWords = useMemo(() => {
    return [...words]
      .sort((a, b) => b.fsrsCard.stability - a.fsrsCard.stability)
      .slice(0, 5)
      .map((w) => w.word);
  }, [words]);

  const weakestWords = useMemo(() => {
    return [...words]
      .sort((a, b) => a.fsrsCard.stability - b.fsrsCard.stability)
      .slice(0, 5)
      .map((w) => w.word);
  }, [words]);

  const totalCards = words.length;
  const cardsDue = words.filter((w) => new Date(w.fsrsCard.due) <= new Date()).length;

  if (!isOpen) return null;

  return (
    <div className="export-report-overlay">
      <div className="export-report-content">
        <div className="export-report-header">
          <h2 className="export-report-title">Learning Progress Report</h2>
          <p className="export-report-date">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="export-report-stats">
          <div className="export-stat-grid">
            {insights.map((insight) => (
              <div key={insight.label} className="export-stat-item">
                <div className="export-stat-label">{insight.label}</div>
                <div className="export-stat-value">{insight.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="export-report-section">
          <h3 className="export-report-section-title">Retention Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="accuracy" stroke="#4488ff" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="export-report-section">
          <h3 className="export-report-section-title">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={posData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ff6b35" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="export-report-section">
          <h3 className="export-report-section-title">Performance Summary</h3>
          <div className="export-report-grid">
            <div className="export-report-item">
              <span className="export-report-item-label">Total Words</span>
              <span className="export-report-item-value">{totalCards}</span>
            </div>
            <div className="export-report-item">
              <span className="export-report-item-label">Cards Due Today</span>
              <span className="export-report-item-value">{cardsDue}</span>
            </div>
            <div className="export-report-item">
              <span className="export-report-item-label">Strongest Words</span>
              <span className="export-report-item-value">
                {strongestWords.join(', ') || 'None'}
              </span>
            </div>
            <div className="export-report-item">
              <span className="export-report-item-label">Weakest Words</span>
              <span className="export-report-item-value">
                {weakestWords.join(', ') || 'None'}
              </span>
            </div>
          </div>
        </div>

        <div className="export-report-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
