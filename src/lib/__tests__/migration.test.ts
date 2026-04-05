import { describe, it, expect } from 'vitest';
import { migrateData } from '../migration';
import type { ExportDataV1, ExportDataV2 } from '../types';

function makeV1Data(words: unknown[] = []): ExportDataV1 {
  return {
    version: 1,
    exportedAt: '2026-01-01T00:00:00Z',
    source: 'dicfr-extension',
    words: words as ExportDataV1['words'],
  };
}

const sampleV1Word = {
  word: 'bonjour',
  normalizedWord: 'bonjour',
  definition: 'hello',
  pos: 'interjection',
  gender: null,
  lookupCount: 3,
  firstLookupAt: '2026-01-01T00:00:00Z',
  lastLookupAt: '2026-03-01T00:00:00Z',
  mastery: 6,
  nextReviewAt: '2026-04-01T00:00:00Z',
  reviewCount: 5,
  lastReviewedAt: '2026-03-15T00:00:00Z',
  easeFactor: 2.5,
};

describe('migrateData', () => {
  it('converts v1 to v2 with FSRS cards', () => {
    const v1 = makeV1Data([sampleV1Word]);
    const v2 = migrateData(v1);
    expect(v2.version).toBe(2);
    expect(v2.words).toHaveLength(1);
    expect(v2.words[0].fsrsCard).toBeDefined();
    expect(v2.words[0].fsrsCard.state).toBe(0);
    expect(v2.words[0].fsrsCard.reps).toBe(0);
  });

  it('returns v2 data unchanged', () => {
    const v2: ExportDataV2 = {
      version: 2,
      exportedAt: '2026-01-01T00:00:00Z',
      source: 'dicfr-app',
      words: [],
    };
    const result = migrateData(v2);
    expect(result).toBe(v2);
  });

  it('preserves word metadata', () => {
    const v1 = makeV1Data([sampleV1Word]);
    const v2 = migrateData(v1);
    const word = v2.words[0];
    expect(word.word).toBe('bonjour');
    expect(word.definition).toBe('hello');
    expect(word.pos).toBe('interjection');
    expect(word.lookupCount).toBe(3);
  });

  it('handles malformed words gracefully', () => {
    const v1 = makeV1Data([{ word: 'test' }]);
    const v2 = migrateData(v1);
    expect(v2.words).toHaveLength(1);
    expect(v2.words[0].word).toBe('test');
    expect(v2.words[0].fsrsCard).toBeDefined();
  });

  it('handles empty words array', () => {
    const v1 = makeV1Data([]);
    const v2 = migrateData(v1);
    expect(v2.version).toBe(2);
    expect(v2.words).toHaveLength(0);
  });
});
