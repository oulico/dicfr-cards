import type { ExportData } from "./types";

const STORAGE_KEY = "dicfr-cards-data";

export function saveData(data: ExportData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadData(): ExportData | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.version === 1 && Array.isArray(parsed.words)) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function clearData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
