import { useState, useCallback, useEffect } from "react";
import type { ExportData, ExportWord } from "./lib/types";
import { saveData, loadData } from "./lib/storage";
import { getReviewQueue } from "./lib/review";
import { sm2 } from "./lib/sm2";
import { ImportScreen } from "./components/ImportScreen";
import { CardView } from "./components/CardView";
import { Summary } from "./components/Summary";

type View = "home" | "study" | "summary";

interface SessionResult {
  total: number;
  correct: number;
  grades: number[];
}

function App() {
  const [data, setData] = useState<ExportData | null>(loadData);
  const [view, setView] = useState<View>("home");
  const [queue, setQueue] = useState<ExportWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [session, setSession] = useState<SessionResult>({ total: 0, correct: 0, grades: [] });

  const dueCount = data ? getReviewQueue(data.words).length : 0;

  useEffect(() => {
    if (data) saveData(data);
  }, [data]);

  const handleImport = useCallback((imported: ExportData) => {
    if (!imported.words.length) return;

    setData((prev) => {
      if (!prev) return imported;

      const existing = new Map(prev.words.map((w) => [w.normalizedWord, w]));
      for (const w of imported.words) {
        const e = existing.get(w.normalizedWord);
        if (e) {
          existing.set(w.normalizedWord, {
            ...e,
            lookupCount: Math.max(e.lookupCount, w.lookupCount),
            lastLookupAt: e.lastLookupAt > w.lastLookupAt ? e.lastLookupAt : w.lastLookupAt,
          });
        } else {
          existing.set(w.normalizedWord, w);
        }
      }

      return { ...prev, words: Array.from(existing.values()) };
    });
  }, []);

  const startStudy = useCallback(() => {
    if (!data) return;
    const q = getReviewQueue(data.words);
    if (q.length === 0) return;
    setQueue(q);
    setCurrentIndex(0);
    setSession({ total: 0, correct: 0, grades: [] });
    setView("study");
  }, [data]);

  const handleRate = useCallback(
    (quality: number) => {
      if (!data) return;
      const card = queue[currentIndex];

      const result = sm2(
        {
          easeFactor: card.easeFactor || 2.5,
          interval: card.mastery || 0,
          repetitions: card.reviewCount || 0,
        },
        quality
      );

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          words: prev.words.map((w) =>
            w.normalizedWord === card.normalizedWord
              ? {
                  ...w,
                  mastery: result.interval,
                  easeFactor: result.easeFactor,
                  reviewCount: result.repetitions,
                  nextReviewAt: result.nextReviewAt,
                  lastReviewedAt: new Date().toISOString(),
                }
              : w
          ),
        };
      });

      setSession((s) => ({
        total: s.total + 1,
        correct: quality >= 3 ? s.correct + 1 : s.correct,
        grades: [...s.grades, quality],
      }));

      if (currentIndex + 1 < queue.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        setView("summary");
      }
    },
    [data, queue, currentIndex]
  );

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-title">dicfr cards</span>
        {data && view !== "home" && (
          <button type="button" className="nav-btn" onClick={() => setView("home")}>
            Home
          </button>
        )}
      </header>

      {view === "home" && (
        <ImportScreen
          onImport={handleImport}
          hasData={!!data && data.words.length > 0}
          dueCount={dueCount}
          onStudy={startStudy}
        />
      )}

      {view === "study" && queue[currentIndex] && (
        <CardView
          card={queue[currentIndex]}
          index={currentIndex}
          total={queue.length}
          onRate={handleRate}
        />
      )}

      {view === "summary" && data && (
        <Summary
          result={session}
          data={data}
          onRestart={startStudy}
          onHome={() => setView("home")}
        />
      )}
    </div>
  );
}

export default App;
