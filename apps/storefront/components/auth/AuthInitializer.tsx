'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { refreshTokenClient } from '@/services/auth.service';

/**
 * AuthInitializer — chạy một lần khi app mount.
 *
 * Khi user load lại trang:
 *  1. accessToken bị mất (in-memory Zustand)
 *  2. Đọc refreshToken từ Cookie
 *  3. Gọi /auth/refresh → nhận accessToken + thông tin user mới
 *  4. setAuth() → Zustand có đủ thông tin, app tiếp tục bình thường
 *
 * Nếu không có cookie hoặc refresh thất bại → trạng thái "chưa đăng nhập"
 */
export default function AuthInitializer() {
  const { getRefreshToken, setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const silentRefresh = async () => {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // Không có cookie → chưa đăng nhập, kết thúc loading
        setLoading(false);
        return;
      }

      try {
        const data = await refreshTokenClient(refreshToken);
        setAuth(data); // cập nhật store + cookie
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
