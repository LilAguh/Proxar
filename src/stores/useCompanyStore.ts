import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Company {
  slug: string;
  name: string;
  logoUrl?: string;
  timeZoneId?: string;
}

interface CompanyStore {
  company: Company | null;
  _hasHydrated: boolean;
  setCompany: (company: Company) => void;
  clearCompany: () => void;
  hasCompany: () => boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      company: null,
      _hasHydrated: false,

      setCompany: (company) => {
        set({ company, _hasHydrated: true });
      },

      clearCompany: () => {
        set({ company: null });
        localStorage.removeItem('proxar-company');
      },

      hasCompany: () => {
        return get().company !== null;
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'proxar-company',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
