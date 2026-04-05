import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DarkMode = 'system' | 'light' | 'dark';
export type DailyGoalType = 'cards' | 'minutes';

interface SettingsState {
  darkMode: DarkMode;
  dailyGoal: number;
  dailyGoalType: DailyGoalType;
}

interface SettingsActions {
  setDarkMode: (mode: DarkMode) => void;
  setDailyGoal: (goal: number) => void;
  setDailyGoalType: (type: DailyGoalType) => void;
  reset: () => void;
}

const DEFAULT_DAILY_GOAL = 10;
const DEFAULT_DAILY_GOAL_TYPE: DailyGoalType = 'cards';
const DEFAULT_DARK_MODE: DarkMode = 'system';

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      darkMode: DEFAULT_DARK_MODE,
      dailyGoal: DEFAULT_DAILY_GOAL,
      dailyGoalType: DEFAULT_DAILY_GOAL_TYPE,

      setDarkMode: (mode) => set({ darkMode: mode }),

      setDailyGoal: (goal) => set({ dailyGoal: Math.max(1, goal) }),

      setDailyGoalType: (type) => set({ dailyGoalType: type }),

      reset: () =>
        set({
          darkMode: DEFAULT_DARK_MODE,
          dailyGoal: DEFAULT_DAILY_GOAL,
          dailyGoalType: DEFAULT_DAILY_GOAL_TYPE,
        }),
    }),
    {
      name: 'dicfr-settings',
    }
  )
);
