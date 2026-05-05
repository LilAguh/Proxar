import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@core/entities/User.entity';
import { UserRole } from '@core/enums';

interface AuthStore {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  _hasHydrated: boolean;
  setAuth: (user: User, token: string, refreshToken: string, expiresAt: string, refreshTokenExpiresAt: string) => void;
  clearAuth: () => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      expiresAt: null,
      refreshTokenExpiresAt: null,
      _hasHydrated: false,

      setAuth: (user, token, refreshToken, expiresAt, refreshTokenExpiresAt) => {
        set({ user, token, refreshToken, expiresAt, refreshTokenExpiresAt, _hasHydrated: true });
      },

      clearAuth: () => {
        set({ user: null, token: null, refreshToken: null, expiresAt: null, refreshTokenExpiresAt: null });
        localStorage.removeItem('token');
        localStorage.removeItem('proxar-auth');
      },

      logout: () => {
        set({ user: null, token: null, refreshToken: null, expiresAt: null, refreshTokenExpiresAt: null });
        localStorage.removeItem('token');
        localStorage.removeItem('proxar-auth');
      },

      isAuthenticated: () => {
        const token = get().token;
        if (!token) return false;

        // Verificar si el token expiró
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const exp = payload.exp * 1000; // convertir a ms
          return Date.now() < exp;
        } catch {
          return false;
        }
      },

      isAdmin: () => {
        const user = get().user;
        return user?.role === UserRole.Admin;
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'proxar-auth',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);