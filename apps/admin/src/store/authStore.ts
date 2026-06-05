import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  errorCount: number;
  isBlocked: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setHasHydrated: (val: boolean) => void;
  incrementErrorCount: () => void;
  resetErrorCount: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      errorCount: 0,
      isBlocked: false,
      setAuth: (token, user) => set({ 
        accessToken: token, 
        user, 
        isAuthenticated: true,
        errorCount: 0,
        isBlocked: false
      }),
      clearAuth: () => set({ 
        accessToken: null, 
        user: null, 
        isAuthenticated: false 
      }),
      setHasHydrated: (val) => set({ hasHydrated: val }),
      incrementErrorCount: () => {
        set((state) => {
          const newCount = state.errorCount + 1;
          return { 
            errorCount: newCount,
            isBlocked: newCount >= 3
          };
        });
      },
      resetErrorCount: () => set({ errorCount: 0, isBlocked: false }),
    }),
    {
      name: 'cacao-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasHydrated: state.hasHydrated,
        errorCount: state.errorCount,
        isBlocked: state.isBlocked,
      }),
      onRehydrateStorage: (state) => {
        return () => state?.setHasHydrated(true);
      },
    }
  )
);
