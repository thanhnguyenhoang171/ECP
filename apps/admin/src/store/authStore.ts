import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { extractRolesFromToken } from '@/lib/jwt';

interface User {
  id: string;
  email: string;
  provider?: string | null;
  roles: string[];
  role?: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  phone?: string | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  avatarPublicId?: string | null;
  dob?: string | null;
  gender?: string | null;
  createdAt?: string;
  updatedAt?: string;
  phoneVerified?: boolean;
  active?: boolean;
  emailVerified?: boolean;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  isInitialized: boolean; // Set to true after AuthInitializer completes token refresh and profile fetch
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
      setAuth: (token, user) => {
        const decodedRoles = extractRolesFromToken(token);
        const mergedRoles = user?.roles && user.roles.length > 0
          ? user.roles
          : decodedRoles;

        set({ 
          accessToken: token, 
          user: user ? { ...user, roles: mergedRoles } : user, 
          isAuthenticated: true,
          errorCount: 0,
          isBlocked: false
        });
      },
      updateAccessToken: (token) => {
        const decodedRoles = extractRolesFromToken(token);
        set((state) => ({
          accessToken: token,
          user: state.user
            ? {
                ...state.user,
                roles: state.user.roles && state.user.roles.length > 0 ? state.user.roles : decodedRoles,
              }
            : state.user,
        }));
      },
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
