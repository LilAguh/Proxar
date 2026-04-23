import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@core/entities/User.entity';

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: (user, token) => {
        set({ user, token });
        localStorage.setItem('token', token);
      },

      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('token');
      },

      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'proxar-auth',
    }
  )
);