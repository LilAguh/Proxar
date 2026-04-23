import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@core/entities/User.entity';
import { UserRole } from '@core/enums';

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

// MOCK USER TEMPORAL
const MOCK_USER: User = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Agustín',
  email: 'admin@proxar.com',
  role: UserRole.Admin,
  active: true,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: MOCK_USER, // ← MOCK temporal
      token: 'mock-token', // ← MOCK temporal

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