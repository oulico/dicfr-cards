export interface ExportData {
  version: 1;
  exportedAt: string;
  source: "dicfr-extension" | "dicfr-app";
  words: ExportWord[];
}

export interface ExportWord {
  word: string;
  normalizedWord: string;
  definition: string;
  pos?: string | null;
  gender?: string | null;
  lookupCount: number;
  firstLookupAt: string;
  lastLookupAt: string;
  mastery: number;
  nextReviewAt: string | null;
  reviewCount: number;
  lastReviewedAt: string | null;
  easeFactor: number;
}
