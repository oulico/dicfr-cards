import type { StudyDay } from './types';

export function getLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateStreak(studyDays: StudyDay[], today: string): number {
  if (studyDays.length === 0) return 0;

  const sortedDays = [...studyDays].sort((a, b) => b.date.localeCompare(a.date));
  const latestDate = sortedDays[0].date;

  const latestStudyDate = new Date(latestDate);
  const todayDate = new Date(today);
  const diffDays = Math.floor((todayDate.getTime() - latestStudyDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays > 1) return 0;

  let streak = 0;
  let currentDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const found = sortedDays.find((d) => d.date === dateStr);

    if (found && found.cardsReviewed > 0) {
      streak++;
    } else if (streak > 0) {
      break;
    }

    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

export function addStudyDay(days: StudyDay[], date: string, stats: Partial<StudyDay>): StudyDay[] {
  const existing = days.find((d) => d.date === date);

  if (existing) {
    return days.map((d) =>
      d.date === date
        ? {
            date,
            cardsReviewed: stats.cardsReviewed ?? existing.cardsReviewed,
            correctCount: stats.correctCount ?? existing.correctCount,
            minutesStudied: stats.minutesStudied ?? existing.minutesStudied,
          }
        : d
    );
  }

  return [
    ...days,
    {
      date,
      cardsReviewed: stats.cardsReviewed ?? 0,
      correctCount: stats.correctCount ?? 0,
      minutesStudied: stats.minutesStudied ?? 0,
    },
  ];
}

export function checkStreakFreeze(days: StudyDay[], currentStreak: number): { froze: boolean; newStreak: number } {
  if (currentStreak < 7) return { froze: false, newStreak: currentStreak };

  const today = getLocalDate();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const todayStudied = days.some((d) => d.date === today && d.cardsReviewed > 0);
  const yesterdayStudied = days.some((d) => d.date === yesterdayStr && d.cardsReviewed > 0);

  if (todayStudied || yesterdayStudied) {
    return { froze: false, newStreak: currentStreak };
  }

  return { froze: true, newStreak: currentStreak - 1 };
}

export function mergeStudyDays(local: StudyDay[], remote: StudyDay[]): StudyDay[] {
  const mergedMap = new Map<string, StudyDay>();

  for (const day of local) {
    mergedMap.set(day.date, { ...day });
  }

  for (const day of remote) {
    const existing = mergedMap.get(day.date);
    if (existing) {
      mergedMap.set(day.date, {
        date: day.date,
        cardsReviewed: Math.max(existing.cardsReviewed, day.cardsReviewed),
        correctCount: Math.max(existing.correctCount, day.correctCount),
        minutesStudied: Math.max(existing.minutesStudied, day.minutesStudied),
      });
    } else {
      mergedMap.set(day.date, { ...day });
    }
  }

  return Array.from(mergedMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}
