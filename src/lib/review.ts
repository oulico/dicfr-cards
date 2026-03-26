import type { ExportWord } from "./types";

export function getReviewQueue(words: ExportWord[]): ExportWord[] {
  const now = new Date().toISOString();

  return words
    .filter((w) => {
      if (!w.nextReviewAt) return true;
      return w.nextReviewAt <= now;
    })
    .sort((a, b) => {
      if (!a.nextReviewAt && !b.nextReviewAt) return 0;
      if (!a.nextReviewAt) return -1;
      if (!b.nextReviewAt) return 1;
      return a.nextReviewAt.localeCompare(b.nextReviewAt);
    });
}
