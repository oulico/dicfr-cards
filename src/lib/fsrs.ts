import { fsrs, generatorParameters, type Card, type ReviewLog, type Grade, type RecordLogItem } from 'ts-fsrs';
import type { ExportWordV2, SerializedFSRSCard, SerializedReviewLog } from './types';

export function createFSRS() {
  const params = generatorParameters({ enable_fuzz: false });
  return fsrs(params);
}

export function serializeCard(card: Card): SerializedFSRSCard {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? card.last_review.toISOString() : null,
    learning_steps: card.learning_steps,
  };
}

export function deserializeCard(sc: SerializedFSRSCard): Card {
  return {
    due: new Date(sc.due),
    stability: sc.stability,
    difficulty: sc.difficulty,
    elapsed_days: sc.elapsed_days,
    scheduled_days: sc.scheduled_days,
    reps: sc.reps,
    lapses: sc.lapses,
    state: sc.state,
    last_review: sc.last_review ? new Date(sc.last_review) : undefined,
    learning_steps: sc.learning_steps,
  };
}

export function scheduleReview(card: Card, rating: Grade, now: Date = new Date()): { card: Card; log: ReviewLog } {
  const f = createFSRS();
  const scheduling = f.repeat(card, now);
  // f.repeat returns an iterable of RecordLogItem; find the one matching the rating
  let result: RecordLogItem | undefined;
  for (const item of scheduling) {
    if (item.log.rating === rating) {
      result = item;
      break;
    }
  }
  if (!result) {
    throw new Error(`No scheduling result for rating ${rating}`);
  }
  return { card: result.card, log: result.log };
}

export function getReviewQueue(words: ExportWordV2[]): ExportWordV2[] {
  const now = new Date();
  return words
    .filter((w) => new Date(w.fsrsCard.due) <= now)
    .sort((a, b) => new Date(a.fsrsCard.due).getTime() - new Date(b.fsrsCard.due).getTime());
}

export function serializeReviewLog(log: ReviewLog, cardKey: string): SerializedReviewLog {
  return {
    card: cardKey,
    rating: log.rating,
    state: log.state,
    due: log.due.toISOString(),
    stability: log.stability,
    difficulty: log.difficulty,
    elapsed_days: log.elapsed_days,
    scheduled_days: log.scheduled_days,
    review: log.review.toISOString(),
  };
}
