import { describe, it, expect } from 'vitest';
import { calculateStreak, addStudyDay, mergeStudyDays } from '../streak';
import type { StudyDay } from '../types';

function day(date: string, cards = 5): StudyDay {
  return { date, cardsReviewed: cards, correctCount: cards, minutesStudied: 3 };
}

describe('calculateStreak', () => {
  it('returns 0 for empty array', () => {
    expect(calculateStreak([], '2026-04-01')).toBe(0);
  });

  it('counts 5 consecutive days', () => {
    const days = [day('2026-03-28'), day('2026-03-29'), day('2026-03-30'), day('2026-03-31'), day('2026-04-01')];
    expect(calculateStreak(days, '2026-04-01')).toBe(5);
  });

  it('counts from yesterday if today not studied', () => {
    const days = [day('2026-03-30'), day('2026-03-31')];
    expect(calculateStreak(days, '2026-04-01')).toBe(2);
  });

  it('breaks at gap', () => {
    const days = [day('2026-03-28'), day('2026-03-30'), day('2026-03-31'), day('2026-04-01')];
    expect(calculateStreak(days, '2026-04-01')).toBe(3);
  });

  it('returns 1 for studying today only', () => {
    expect(calculateStreak([day('2026-04-01')], '2026-04-01')).toBe(1);
  });

  it('returns 0 if last study was more than 1 day ago', () => {
    expect(calculateStreak([day('2026-03-28')], '2026-04-01')).toBe(0);
  });
});

describe('addStudyDay', () => {
  it('appends new date', () => {
    const result = addStudyDay([], '2026-04-01', { cardsReviewed: 10 });
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2026-04-01');
    expect(result[0].cardsReviewed).toBe(10);
  });

  it('updates existing date', () => {
    const existing = [day('2026-04-01', 5)];
    const result = addStudyDay(existing, '2026-04-01', { cardsReviewed: 15 });
    expect(result).toHaveLength(1);
    expect(result[0].cardsReviewed).toBe(15);
  });
});

describe('mergeStudyDays', () => {
  it('unions by date', () => {
    const local = [day('2026-04-01')];
    const remote = [day('2026-04-02')];
    const result = mergeStudyDays(local, remote);
    expect(result).toHaveLength(2);
  });

  it('keeps max cardsReviewed for same date', () => {
    const local = [day('2026-04-01', 5)];
    const remote = [day('2026-04-01', 10)];
    const result = mergeStudyDays(local, remote);
    expect(result).toHaveLength(1);
    expect(result[0].cardsReviewed).toBe(10);
  });

  it('handles one side empty', () => {
    const local = [day('2026-04-01')];
    expect(mergeStudyDays(local, [])).toHaveLength(1);
    expect(mergeStudyDays([], local)).toHaveLength(1);
  });
});
