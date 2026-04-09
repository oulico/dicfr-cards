import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExportWordV2, SerializedReviewLog } from '../lib/types';
import type { Grade } from 'ts-fsrs';
import { deserializeCard, serializeCard, scheduleReview } from '../lib/fsrs';

interface CardState {
  words: ExportWordV2[];
  reviewLogs: SerializedReviewLog[];
  reviewQueue: ExportWordV2[];
  dueCount: number;
}

interface CardActions {
  setWords: (words: ExportWordV2[]) => void;
  addWords: (newWords: ExportWordV2[]) => void;
  updateCardAfterReview: (normalizedWord: string, rating: Grade) => void;
  addReviewLog: (log: SerializedReviewLog) => void;
  pruneOldLogs: () => void;
  refreshReviewQueue: () => void;
}

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export const useCardStore = create<CardState & CardActions>()(
  persist(
    (set, get) => ({
      words: [],
      reviewLogs: [],
      reviewQueue: [],
      dueCount: 0,

      setWords: (words) => {
        const { refreshReviewQueue } = get();
        set({ words });
        refreshReviewQueue();
      },

      addWords: (newWords) => {
        const { words, refreshReviewQueue } = get();
        const existingMap = new Map(words.map((w) => [w.normalizedWord, w]));

        for (const word of newWords) {
          const existing = existingMap.get(word.normalizedWord);
          if (existing) {
            existingMap.set(word.normalizedWord, {
              ...existing,
              lookupCount: Math.max(existing.lookupCount, word.lookupCount),
              lastLookupAt: existing.lastLookupAt > word.lastLookupAt ? existing.lastLookupAt : word.lastLookupAt,
            });
          } else {
            existingMap.set(word.normalizedWord, {
              ...word,
              cardId: word.cardId || crypto.randomUUID(),
            });
          }
        }

        set({ words: Array.from(existingMap.values()) });
        refreshReviewQueue();
      },

      updateCardAfterReview: (normalizedWord, rating) => {
        const { words, addReviewLog, refreshReviewQueue } = get();
        const word = words.find((w) => w.normalizedWord === normalizedWord);
        if (!word) return;

        const card = deserializeCard(word.fsrsCard);
        const now = new Date();
        const result = scheduleReview(card, rating, now);

        const updatedWord = {
          ...word,
          fsrsCard: serializeCard(result.card),
        };

        const serializedLog = {
          card: normalizedWord,
          rating: result.log.rating,
          state: result.log.state,
          due: result.log.due.toISOString(),
          stability: result.log.stability,
          difficulty: result.log.difficulty,
          elapsed_days: result.log.elapsed_days,
          scheduled_days: result.log.scheduled_days,
          review: result.log.review.toISOString(),
        };

        addReviewLog(serializedLog);

        set({
          words: words.map((w) => (w.normalizedWord === normalizedWord ? updatedWord : w)),
        });
        refreshReviewQueue();
      },

      addReviewLog: (log) => {
        const { reviewLogs } = get();
        set({ reviewLogs: [log, ...reviewLogs] });
        get().pruneOldLogs();
      },

      pruneOldLogs: () => {
        const { reviewLogs } = get();
        const cutoff = new Date(Date.now() - NINETY_DAYS_MS);
        const prunedLogs = reviewLogs.filter((log) => new Date(log.review) > cutoff);
        set({ reviewLogs: prunedLogs });
      },

      refreshReviewQueue: () => {
        const { words } = get();
        const now = new Date();
        const queue = words
          .filter((w) => new Date(w.fsrsCard.due) <= now)
          .sort((a, b) => new Date(a.fsrsCard.due).getTime() - new Date(b.fsrsCard.due).getTime());
        set({ reviewQueue: queue, dueCount: queue.length });
      },
    }),
    {
      name: 'dicfr-cards-data',
      partialize: (state) => ({ words: state.words, reviewLogs: state.reviewLogs }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.refreshReviewQueue();
        }
      },
    }
  )
);
