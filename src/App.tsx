import { useState, useCallback, useEffect } from "react";
import type { ExportData, ExportWord } from "./lib/types";
import { saveData, loadData } from "./lib/storage";
import { getReviewQueue } from "./lib/review";
import { sm2 } from "./lib/sm2";
import {
  type AuthUser,
  getStoredAuth,
  startGoogleLogin,
  handleAuthCallback,
  authenticateWithAPI,
  logout,
  syncPush,
  syncPull,
} from "./lib/api";
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
  const [user, setUser] = useState<AuthUser | null>(getStoredAuth()?.user ?? null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const dueCount = data ? getReviewQueue(data.words).length : 0;

  useEffect(() => {
    if (data) saveData(data);
  }, [data]);

  useEffect(() => {
    const cb = handleAuthCallback();
    if (cb) {
      authenticateWithAPI(cb.token)
        .then((u) => {
          setUser(u);
          return syncPull();
        })
        .then((serverData) => {
          setData((prev) => {
            if (!prev) return serverData;
            const existing = new Map(prev.words.map((w) => [w.normalizedWord, w]));
            for (const w of serverData.words) {
              const e = existing.get(w.normalizedWord);
              if (e) {
                existing.set(w.normalizedWord, {
                  ...e,
                  lookupCount: Math.max(e.lookupCount, w.lookupCount),
                  lastLookupAt: e.lastLookupAt > w.lastLookupAt ? e.lastLookupAt : w.lastLookupAt,
                  mastery: w.lastReviewedAt && (!e.lastReviewedAt || w.lastReviewedAt > e.lastReviewedAt) ? w.mastery : e.mastery,
                  nextReviewAt: w.lastReviewedAt && (!e.lastReviewedAt || w.lastReviewedAt > e.lastReviewedAt) ? w.nextReviewAt : e.nextReviewAt,
                  reviewCount: Math.max(e.reviewCount, w.reviewCount),
                  lastReviewedAt: !e.lastReviewedAt ? w.lastReviewedAt : (!w.lastReviewedAt ? e.lastReviewedAt : e.lastReviewedAt > w.lastReviewedAt ? e.lastReviewedAt : w.lastReviewedAt),
                  easeFactor: w.lastReviewedAt && (!e.lastReviewedAt || w.lastReviewedAt > e.lastReviewedAt) ? w.easeFactor : e.easeFactor,
                });
              } else {
                existing.set(w.normalizedWord, w);
              }
            }
            return { ...prev, words: Array.from(existing.values()) };
          });
          setSyncMessage("Synced from server");
        })
        .catch(() => setSyncMessage("Sync failed"));
    }
  }, []);

  const handleSync = useCallback(async () => {
    if (!data || syncing) return;
    setSyncing(true);
    setSyncMessage("");
    try {
      await syncPush(data.words);
      const serverData = await syncPull();
      setData((prev) => {
        if (!prev) return serverData;
        const existing = new Map(prev.words.map((w) => [w.normalizedWord, w]));
        for (const w of serverData.words) {
          if (!existing.has(w.normalizedWord)) {
            existing.set(w.normalizedWord, w);
          }
        }
        return { ...prev, words: Array.from(existing.values()) };
      });
      setSyncMessage("Synced!");
    } catch {
      setSyncMessage("Sync failed");
    }
    setSyncing(false);
    setTimeout(() => setSyncMessage(""), 3000);
  }, [data, syncing]);

  const handleLogout = useCallback(() => {
    logout();
    setUser(null);
  }, []);

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
        <div className="header-actions">
          {data && view !== "home" && (
            <button type="button" className="nav-btn" onClick={() => setView("home")}>
              Home
            </button>
          )}
          {user ? (
            <>
              <button type="button" className="nav-btn" onClick={handleSync} disabled={syncing}>
                {syncing ? "..." : "Sync"}
              </button>
              <button type="button" className="nav-btn" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <button type="button" className="nav-btn" onClick={startGoogleLogin}>
              Sign in
            </button>
          )}
        </div>
      </header>
      {syncMessage && <div className="sync-msg">{syncMessage}</div>}

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
