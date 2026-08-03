'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { refreshTokenClient, getAccountInfo } from '@/services/auth.service';

/**
 * AuthInitializer — chạy một lần khi app mount.
 *
 * Khi user load lại trang (F5):
 *  1. accessToken bị mất (in-memory Zustand)
 *  2. Đọc refreshToken từ Cookie
 *  3. Gọi /auth/refresh → nhận accessToken + refreshToken mới
 *  4. Gọi /v1/users/account với accessToken vừa lấy → lấy đầy đủ profile
 *  5. setAuth() với data đầy đủ → Zustand cập nhật, app tiếp tục bình thường
 *
 * Nếu không có cookie hoặc refresh thất bại → trạng thái "chưa đăng nhập"
 */
export default function AuthInitializer() {
  const { getRefreshToken, setAuth, updateTokens, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const silentRefresh = async () => {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // Không có cookie → chưa đăng nhập, kết thúc loading
        setLoading(false);
        return;
      }

      try {
        // Bước 1: lấy access token mới từ refresh token
        const tokenData = await refreshTokenClient(refreshToken);

        // Bước 2: lưu token vào store (chưa có user info, nhưng cần để gọi API tiếp)
        updateTokens(tokenData.accessToken, tokenData.refreshToken);

        // Bước 3: lấy thông tin profile đầy đủ từ server (có avatarUrl, firstName, lastName…)
        const profile = await getAccountInfo();

        // Bước 4: cập nhật store với thông tin đầy đủ
        setAuth({
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          id: profile.id,
          email: profile.email,
          roles: profile.roles || [],
          username: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatarUrl: profile.avatarUrl,
        });
      } catch {
        // Cookie hết hạn hoặc bị xóa
        clearAuth();
      }
    };

    silentRefresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Component này không render gì — chỉ chạy side effect
  return null;
}
