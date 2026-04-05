import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StudyDay } from '../lib/types';
import { getLocalDate, calculateStreak, addStudyDay, checkStreakFreeze, mergeStudyDays } from '../lib/streak';

interface StreakState {
  studyDays: StudyDay[];
  freezeAvailable: boolean;
  lastFreezeStreak: number;
  currentStreak: number;
}

interface StreakActions {
  recordStudy: (stats: Partial<StudyDay>) => void;
  getStreak: () => number;
  checkFreeze: () => { froze: boolean; newStreak: number };
  mergeStudyDays: (remoteStudyDays: StudyDay[]) => void;
  reset: () => void;
}

export const useStreakStore = create<StreakState & StreakActions>()(
  persist(
    (set, get) => ({
      studyDays: [],
      freezeAvailable: false,
      lastFreezeStreak: 0,
      currentStreak: 0,

      recordStudy: (stats) => {
        const { studyDays } = get();
        const today = getLocalDate();
        const updatedDays = addStudyDay(studyDays, today, stats);

        const streak = calculateStreak(updatedDays, today);
        const freezeCheck = checkStreakFreeze(updatedDays, streak);

        set({
          studyDays: updatedDays,
          currentStreak: freezeCheck.newStreak,
          freezeAvailable: freezeCheck.froze ? false : streak >= 7,
          lastFreezeStreak: freezeCheck.froze ? streak : get().lastFreezeStreak,
        });
      },

      getStreak: () => {
        const { studyDays } = get();
        const today = getLocalDate();
        return calculateStreak(studyDays, today);
      },

      checkFreeze: () => {
        const { studyDays } = get();
        const today = getLocalDate();
        const streak = calculateStreak(studyDays, today);
        const freezeCheck = checkStreakFreeze(studyDays, streak);

        set({
          currentStreak: freezeCheck.newStreak,
          freezeAvailable: freezeCheck.froze ? false : freezeCheck.newStreak >= 7,
          lastFreezeStreak: freezeCheck.froze ? freezeCheck.newStreak : get().lastFreezeStreak,
        });

        return freezeCheck;
      },

      mergeStudyDays: (remoteStudyDays) => {
        const { studyDays } = get();
        const merged = mergeStudyDays(studyDays, remoteStudyDays);
        const today = getLocalDate();
        const streak = calculateStreak(merged, today);

        set({
          studyDays: merged,
          currentStreak: streak,
          freezeAvailable: streak >= 7,
        });
      },

      reset: () => {
        set({
          studyDays: [],
          freezeAvailable: false,
          lastFreezeStreak: 0,
          currentStreak: 0,
        });
      },
    }),
    {
      name: 'dicfr-streak',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const today = getLocalDate();
          state.currentStreak = calculateStreak(state.studyDays, today);
          state.freezeAvailable = state.currentStreak >= 7;
        }
      },
    }
  )
);
