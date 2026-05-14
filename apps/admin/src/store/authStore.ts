import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  username: string;
  email: string;
  roles: string[];
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setHasHydrated: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      setAuth: (token, user) => set({ 
        accessToken: token, 
        user, 
        isAuthenticated: true 
      }),
      clearAuth: () => set({ 
        accessToken: null, 
        user: null, 
        isAuthenticated: false 
      }),
      setHasHydrated: (val) => set({ hasHydrated: val }),
    }),
    {
      name: 'ecp-auth-storage',
      onRehydrateStorage: (state) => {
        return () => state?.setHasHydrated(true);
      },
    }
  )
);


