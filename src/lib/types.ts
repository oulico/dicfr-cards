export interface ExportDataV1 {
  version: 1;
  exportedAt: string;
  source: "dicfr-extension" | "dicfr-app";
  words: ExportWordV1[];
}

export interface ExportDataV2 {
  version: 2;
  exportedAt: string;
  source: "dicfr-extension" | "dicfr-app";
  words: ExportWordV2[];
  studyDays?: StudyDay[];
}

export type ExportData = ExportDataV1 | ExportDataV2;

export interface ExportWordBase {
  word: string;
  normalizedWord: string;
  definition: string;
  pos?: string | null;
  gender?: string | null;
  lookupCount: number;
  firstLookupAt: string;
  lastLookupAt: string;
}

export interface ExportWordV1 extends ExportWordBase {
  mastery: number;
  nextReviewAt: string | null;
  reviewCount: number;
  lastReviewedAt: string | null;
  easeFactor: number;
}

export interface SerializedFSRSCard {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  last_review: string | null;
  learning_steps: number;
}

export interface ExportWordV2 extends ExportWordBase {
  fsrsCard: SerializedFSRSCard;
}

export type ExportWord = ExportWordV1 | ExportWordV2;

export interface StudyDay {
  date: string;
  cardsReviewed: number;
  correctCount: number;
  minutesStudied: number;
}

export interface SerializedReviewLog {
  card: string;
  rating: number;
  state: number;
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  review: string;
}
