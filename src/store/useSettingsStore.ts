import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DarkMode = 'system' | 'light' | 'dark';
export type DailyGoalType = 'cards' | 'minutes';

interface SettingsState {
  darkMode: DarkMode;
  dailyGoal: number;
  dailyGoalType: DailyGoalType;
  notificationsEnabled: boolean;
}

interface SettingsActions {
  setDarkMode: (mode: DarkMode) => void;
  setDailyGoal: (goal: number) => void;
  setDailyGoalType: (type: DailyGoalType) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  reset: () => void;
}

const DEFAULT_DAILY_GOAL = 10;
const DEFAULT_DAILY_GOAL_TYPE: DailyGoalType = 'cards';
const DEFAULT_DARK_MODE: DarkMode = 'system';
const DEFAULT_NOTIFICATIONS_ENABLED = false;

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      darkMode: DEFAULT_DARK_MODE,
      dailyGoal: DEFAULT_DAILY_GOAL,
      dailyGoalType: DEFAULT_DAILY_GOAL_TYPE,
      notificationsEnabled: DEFAULT_NOTIFICATIONS_ENABLED,

      setDarkMode: (mode) => set({ darkMode: mode }),

      setDailyGoal: (goal) => set({ dailyGoal: Math.max(1, goal) }),

      setDailyGoalType: (type) => set({ dailyGoalType: type }),

      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),

      reset: () =>
        set({
          darkMode: DEFAULT_DARK_MODE,
          dailyGoal: DEFAULT_DAILY_GOAL,
          dailyGoalType: DEFAULT_DAILY_GOAL_TYPE,
          notificationsEnabled: DEFAULT_NOTIFICATIONS_ENABLED,
        }),
    }),
    {
      name: 'dicfr-settings',
    }
  )
);
