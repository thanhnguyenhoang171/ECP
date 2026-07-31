import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  isInitialized: boolean; // true sau khi AuthInitializer đã chạy xong (refresh + fetch profile)
  errorCount: number;
  isBlocked: boolean;
  setAuth: (token: string, user: User) => void;
  updateAccessToken: (token: string) => void;
  clearAuth: () => void;
  setHasHydrated: (val: boolean) => void;
  setInitialized: (val: boolean) => void;
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
      isInitialized: false,
      errorCount: 0,
      isBlocked: false,
      setAuth: (token, user) => set({ 
        accessToken: token, 
        user, 
        isAuthenticated: true,
        errorCount: 0,
        isBlocked: false
      }),
      updateAccessToken: (token) => set({ accessToken: token }),
      setInitialized: (val) => set({ isInitialized: val }),
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
