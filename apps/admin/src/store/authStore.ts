import { create } from 'zustand';

interface User {
  username: string;
  email: string;
  roles: string[];
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
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
}));
