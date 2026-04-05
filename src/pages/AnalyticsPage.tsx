import { useMemo, useState } from 'react';
import { useCardStore } from '../store/useCardStore';
import { useStreakStore } from '../store/useStreakStore';
import { ExportReport } from '../components/ExportReport';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AnalyticsPage() {
  const { words, reviewLogs } = useCardStore();
  const { studyDays } = useStreakStore();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showExportReport, setShowExportReport] = useState(false);

  const hasData = words.length > 0;

  const insights = useMemo(() => {
    if (!hasData) return null;

    const learningCards = words.filter((w) => w.fsrsCard.state === 2).length;
    const reviewingCards = words.filter((w) => w.fsrsCard.state === 1).length;
    const newCards = words.filter((w) => w.fsrsCard.state === 0).length;

    const recentCorrect = reviewLogs.slice(0, 20).filter((log) => log.rating >= 3).length;
    const recentAccuracy = reviewLogs.slice(0, 20).length > 0
      ? Math.round((recentCorrect / Math.min(reviewLogs.length, 20)) * 100)
      : 0;

    return [
      `You've learned ${learningCards} cards and are actively reviewing ${reviewingCards} more.`,
      recentAccuracy >= 80
        ? `Excellent! Your recent accuracy is ${recentAccuracy}%. Keep up the great work.`
        : recentAccuracy >= 60
        ? `Good progress! Your recent accuracy is ${recentAccuracy}%. Consistent practice will improve retention.`
        : `Your recent accuracy is ${recentAccuracy}%. Consider studying more frequently to strengthen memory.`,
      `${newCards} cards are still new. Regular review helps them stick long-term.`,
    ];
  }, [hasData, words, reviewLogs]);

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

  const volumeData = useMemo(() => {
    return studyDays.slice(-14).map((day) => ({
      date: day.date.slice(5),
      cards: day.cardsReviewed,
    }));
  }, [studyDays]);

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

  if (!hasData) {
    return (
      <div className="analytics-page">
        <h2 className="page-title">Learning Analytics</h2>
        <p className="empty-state">Study a few cards first, then check back for insights.</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <h2 className="page-title">Learning Analytics</h2>

      {hasData && (
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setShowExportReport(true)}
          style={{ alignSelf: 'flex-start' }}
        >
          Export Report
        </button>
      )}

      {showExportReport && (
        <ExportReport isOpen={showExportReport} onClose={() => setShowExportReport(false)} />
      )}

      {insights && (
        <div className="insights-section">
          {insights.map((insight) => (
            <p key={insight.slice(0, 20)} className="insight-text">
              {insight}
            </p>
          ))}
        </div>
      )}

      <div className="analytics-accordion">
        <details className="accordion-item" open={expandedSection === 'retention'} onToggle={(e) => setExpandedSection((e.currentTarget as HTMLDetailsElement).open ? 'retention' : null)}>
          <summary className="accordion-summary">Retention Trend</summary>
          <div className="accordion-content">
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
        </details>

        <details className="accordion-item" open={expandedSection === 'pos'} onToggle={(e) => setExpandedSection((e.currentTarget as HTMLDetailsElement).open ? 'pos' : null)}>
          <summary className="accordion-summary">Category Breakdown</summary>
          <div className="accordion-content">
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
        </details>

        <details className="accordion-item" open={expandedSection === 'strength'} onToggle={(e) => setExpandedSection((e.currentTarget as HTMLDetailsElement).open ? 'strength' : null)}>
          <summary className="accordion-summary">Strongest & Weakest Words</summary>
          <div className="accordion-content">
            <div className="strength-lists">
              <div className="strength-section">
                <h3 className="strength-title">Strongest</h3>
                <ul className="strength-words">
                  {strongestWords.map((word) => (
                    <li key={word}>{word}</li>
                  ))}
                </ul>
              </div>
              <div className="strength-section">
                <h3 className="strength-title">Weakest</h3>
                <ul className="strength-words">
                  {weakestWords.map((word) => (
                    <li key={word}>{word}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </details>

        <details className="accordion-item" open={expandedSection === 'volume'} onToggle={(e) => setExpandedSection((e.currentTarget as HTMLDetailsElement).open ? 'volume' : null)}>
          <summary className="accordion-summary">Review Volume</summary>
          <div className="accordion-content">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cards" fill="#44aa99" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </details>
      </div>
    </div>
  );
}
