import type { ExportWordV2 } from "./types";
import { deserializeCard } from "./fsrs";

export function getReviewQueue(words: ExportWordV2[]): ExportWordV2[] {
  const now = new Date();

  return words
    .filter((w) => {
      const card = deserializeCard(w.fsrsCard);
      return card.due <= now;
    })
    .sort((a, b) => {
      const cardA = deserializeCard(a.fsrsCard);
      const cardB = deserializeCard(b.fsrsCard);
      return cardA.due.getTime() - cardB.due.getTime();
    });
}
