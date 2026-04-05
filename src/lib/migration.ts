import { createEmptyCard } from 'ts-fsrs';
import type { ExportData, ExportDataV1, ExportDataV2, ExportWordV1, ExportWordV2, SerializedFSRSCard } from './types';

function createEmptySerializedCard(): SerializedFSRSCard {
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
    last_review: card.last_review ? card.last_review.toISOString() : null,
    learning_steps: card.learning_steps,
  };
}

function isExportWordV1(word: any): word is ExportWordV1 {
  return (
    word &&
    typeof word.word === 'string' &&
    typeof word.normalizedWord === 'string' &&
    typeof word.definition === 'string' &&
    typeof word.lookupCount === 'number' &&
    typeof word.mastery === 'number' &&
    typeof word.reviewCount === 'number' &&
    typeof word.easeFactor === 'number'
  );
}

function migrateWord(word: ExportWordV1): ExportWordV2 {
  const { mastery, nextReviewAt, reviewCount, lastReviewedAt, easeFactor, ...baseWord } = word;

  return {
    ...baseWord,
    fsrsCard: createEmptySerializedCard(),
  };
}

export function migrateData(data: ExportData): ExportDataV2 {
  if (data.version === 2) {
    return data as ExportDataV2;
  }

  const v1Data = data as ExportDataV1;

  const words = (v1Data.words as unknown[]).map((rawWord) => {
    if (!isExportWordV1(rawWord)) {
      const w = rawWord as Record<string, unknown>;
      return {
        word: (w.word as string) || 'unknown',
        normalizedWord: (w.normalizedWord as string) || ((w.word as string) ?? '').toLowerCase() || 'unknown',
        definition: (w.definition as string) || '',
        pos: (w.pos as string | null) || null,
        gender: (w.gender as string | null) || null,
        lookupCount: typeof w.lookupCount === 'number' ? w.lookupCount : 0,
        firstLookupAt: (w.firstLookupAt as string) || new Date().toISOString(),
        lastLookupAt: (w.lastLookupAt as string) || new Date().toISOString(),
        fsrsCard: createEmptySerializedCard(),
      } satisfies ExportWordV2;
    }

    return migrateWord(rawWord);
  });

  return {
    version: 2,
    exportedAt: v1Data.exportedAt,
    source: v1Data.source,
    words,
    studyDays: [],
  };
}
