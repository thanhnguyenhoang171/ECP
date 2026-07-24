import { create } from 'zustand';
import Cookies from 'js-cookie';
import { AuthUser, AuthData } from '@/types/user';

// ─── Hằng số ────────────────────────────────────────────────────────────────
const REFRESH_TOKEN_COOKIE = 'ecp_refresh_token';
const COOKIE_EXPIRES_DAYS = 7;

// ─── Interface Store ─────────────────────────────────────────────────────────
interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (data: AuthData) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  getRefreshToken: () => string | undefined;
}

// ─── Store ───────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // true ban đầu để chờ silent refresh

  /**
   * Lưu thông tin auth sau khi login / register / refresh token thành công.
   * - accessToken: lưu in-memory trong Zustand (mất khi reload → silent refresh từ cookie)
   * - refreshToken: lưu trong Cookie (persist qua reload)
   * - user: { id, username, email, roles }
   */
  setAuth: (data: AuthData) => {
    // Lưu refresh token vào cookie
    Cookies.set(REFRESH_TOKEN_COOKIE, data.refreshToken, {
      expires: COOKIE_EXPIRES_DAYS,
      sameSite: 'Strict',
    });

    set({
      accessToken: data.accessToken,
      user: {
        id: data.id,
        username: data.username,
        email: data.email,
        roles: data.roles,
      },
      isAuthenticated: true,
      isLoading: false,
    });
  },

  /**
   * Xóa toàn bộ trạng thái auth (khi logout hoặc refresh token hết hạn).
   */
  clearAuth: () => {
    Cookies.remove(REFRESH_TOKEN_COOKIE);
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  /**
   * Đọc refresh token từ cookie (dùng trong axios interceptor và AuthInitializer).
   */
  getRefreshToken: () => Cookies.get(REFRESH_TOKEN_COOKIE),
}));
