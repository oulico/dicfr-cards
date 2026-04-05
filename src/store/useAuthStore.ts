import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AuthUser {
  email: string;
  name?: string;
  picture?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setAuth: (token: string | null, user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token, user) => {
        localStorage.setItem('dicfr-auth-token', token);
        localStorage.setItem('dicfr-auth-user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('dicfr-auth-token');
        localStorage.removeItem('dicfr-auth-user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      setAuth: (token, user) => {
        if (token && user) {
          localStorage.setItem('dicfr-auth-token', token);
          localStorage.setItem('dicfr-auth-user', JSON.stringify(user));
          set({ user, token, isAuthenticated: true });
        } else {
          localStorage.removeItem('dicfr-auth-token');
          localStorage.removeItem('dicfr-auth-user');
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'dicfr-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
