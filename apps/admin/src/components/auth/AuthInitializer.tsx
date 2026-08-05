'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

const getAdminBackendUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL;
  return (envUrl && envUrl.startsWith('http')) ? envUrl : 'http://localhost:9090/api';
};
const API_URL = getAdminBackendUrl();

/**
 * Module-level flag — bền vững qua StrictMode unmount/remount,
 * đảm bảo chỉ chạy đúng 1 lần dù React re-invoke effects trong development.
 */
let initialized = false;

/**
 * AuthInitializer — chạy một lần duy nhất khi admin app mount.
 *
 * Khi user load lại trang (F5):
 *  1. Zustand persist đã khôi phục user + isAuthenticated từ localStorage
 *  2. Nhưng accessToken = null (không được persist vì lý do bảo mật)
 *  3. Component này gọi /api/auth/refresh (Next.js route) để lấy accessToken mới
 *  4. Sau đó gọi /v1/users/account để lấy profile mới nhất (avatarUrl, firstName, lastName…)
 *  5. Cập nhật store với thông tin đầy đủ → setInitialized(true)
 *
 * Nếu không có cookie hoặc refresh thất bại → clearAuth() → redirect về /login
 */
export default function AuthInitializer() {
  const { setAuth, updateAccessToken, clearAuth, setInitialized, hasHydrated } = useAuthStore();

  useEffect(() => {
    // Chờ zustand persist hydrate xong từ localStorage trước khi refresh
    if (!hasHydrated) return;

    // Module-level guard — bền vững qua StrictMode unmount/remount
    if (initialized) return;
    initialized = true;

    const initialize = async () => {
      const APP_URL = window.location.origin;
      try {
        // Bước 1: Lấy accessToken mới từ refreshToken trong cookie
        const refreshRes = await fetch(`${APP_URL}/api/auth/refresh`, {
          method: 'POST',
        });

        if (!refreshRes.ok) {
          // Refresh token hết hạn hoặc không có cookie → logout
          clearAuth();
          setInitialized(true);
          return;
        }

        const refreshData = await refreshRes.json();
        if (!refreshData.success || !refreshData.data?.accessToken) {
          clearAuth();
          setInitialized(true);
          return;
        }

        const { accessToken } = refreshData.data;

        // Bước 2: Lưu accessToken tạm để gọi API account
        updateAccessToken(accessToken);

        // Bước 3: Lấy thông tin profile đầy đủ từ /v1/common/users/account (qua Proxy giấu URL backend)
        const accountRes = await fetch('/api/proxy/v1/common/users/account', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!accountRes.ok) {
          // Có token nhưng account bị lỗi → vẫn giữ session
          setInitialized(true);
          return;
        }

        const accountData = await accountRes.json();
        const profile = accountData?.data || accountData;

        // Bước 4: setAuth đầy đủ với thông tin mới nhất
        setAuth(accessToken, {
          id: profile.id,
          email: profile.email,
          roles: profile.roles || (profile.role ? [`ROLE_${profile.role}`] : []),
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatarUrl: profile.avatarUrl,
        });
      } catch (err) {
        console.error('[AuthInitializer] Lỗi khởi tạo session:', err);
        clearAuth();
      } finally {
        setInitialized(true);
      }
    };

    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  // Component này không render gì — chỉ chạy side effect
  return null;
}

