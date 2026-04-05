import { describe, it, expect } from 'vitest';
import { Rating } from 'ts-fsrs';
import { serializeCard, deserializeCard, scheduleReview, getReviewQueue } from '../fsrs';
import type { ExportWordV2, SerializedFSRSCard } from '../types';
import { createEmptyCard } from 'ts-fsrs';

function makeSerializedCard(overrides: Partial<SerializedFSRSCard> = {}): SerializedFSRSCard {
  const card = createEmptyCard();
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: null,
    learning_steps: card.learning_steps,
    ...overrides,
  };
}

function makeWord(normalizedWord: string, due: string): ExportWordV2 {
  return {
    word: normalizedWord,
    normalizedWord,
    definition: 'test def',
    lookupCount: 1,
    firstLookupAt: '2026-01-01T00:00:00Z',
    lastLookupAt: '2026-01-01T00:00:00Z',
    fsrsCard: makeSerializedCard({ due }),
  };
}

describe('serializeCard / deserializeCard', () => {
  it('round-trips a card correctly', () => {
    const card = createEmptyCard();
    const serialized = serializeCard(card);
    const deserialized = deserializeCard(serialized);
    expect(deserialized.stability).toBe(card.stability);
    expect(deserialized.difficulty).toBe(card.difficulty);
    expect(deserialized.reps).toBe(card.reps);
    expect(deserialized.state).toBe(card.state);
  });

  it('handles null last_review', () => {
    const sc = makeSerializedCard({ last_review: null });
    const card = deserializeCard(sc);
    expect(card.last_review).toBeUndefined();
  });
});

describe('scheduleReview', () => {
  it('Rating.Good produces a valid updated card', () => {
    const card = createEmptyCard();
    const result = scheduleReview(card, Rating.Good);
    expect(result.card).toBeDefined();
    expect(result.log).toBeDefined();
    expect(result.log.rating).toBe(Rating.Good);
  });

  it('Rating.Again returns a valid result', () => {
    const card = createEmptyCard();
    const result = scheduleReview(card, Rating.Again);
    expect(result.card).toBeDefined();
    expect(result.log.rating).toBe(Rating.Again);
  });
});

describe('getReviewQueue', () => {
  it('filters words due now and sorts by due date', () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const future = new Date(Date.now() + 86400000).toISOString();
    const words = [makeWord('future', future), makeWord('past', past)];
    const queue = getReviewQueue(words);
    expect(queue).toHaveLength(1);
    expect(queue[0].normalizedWord).toBe('past');
  });
});
