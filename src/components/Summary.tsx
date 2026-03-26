import type { ExportData } from "../lib/types";

interface SessionResult {
  total: number;
  correct: number;
  grades: number[];
}

interface Props {
  result: SessionResult;
  data: ExportData;
  onRestart: () => void;
  onHome: () => void;
}

export function Summary({ result, data, onRestart, onHome }: Props) {
  const pct = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0;
  const avgMastery =
    data.words.length > 0
      ? (data.words.reduce((s, w) => s + w.mastery, 0) / data.words.length).toFixed(1)
      : "0";

  function handleExport() {
    const exportData: ExportData = {
      ...data,
      exportedAt: new Date().toISOString(),
      source: "dicfr-app",
    };
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dicfr-cards-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="summary">
      <h2>Session Complete</h2>

      <div className="stats-grid">
        <div className="stat">
          <span className="stat-value">{result.total}</span>
          <span className="stat-label">reviewed</span>
        </div>
        <div className="stat">
          <span className="stat-value">{pct}%</span>
          <span className="stat-label">correct</span>
        </div>
        <div className="stat">
          <span className="stat-value">{avgMastery}</span>
          <span className="stat-label">avg mastery</span>
        </div>
      </div>

      <div className="summary-actions">
        <button type="button" className="btn-export" onClick={handleExport}>
          Export to dicfr
        </button>
        <button type="button" className="btn-restart" onClick={onRestart}>
          Review Again
        </button>
        <button type="button" className="btn-home" onClick={onHome}>
          Home
        </button>
      </div>
    </div>
  );
}
