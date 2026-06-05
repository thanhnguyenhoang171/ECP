'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { authApi } from '@/features/auth/api/auth.api';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      // Chỉ chạy refresh khi ứng dụng khởi tạo (F5)
      // Không chạy ở trang login/register
      if (pathname === '/login' || pathname === '/register') {
        setIsInitializing(false);
        return;
      }

      try {
        const result = await authApi.refresh();

        if (result.success) {
          const { id, accessToken, username, email, roles } = result.data;
          setAuth(accessToken, { id, username, email, roles });
        }
      } catch (error: any) {
        if (error.status === 401) {
          // Chỉ xóa auth nếu server xác nhận token không hợp lệ
          clearAuth();
        }
        console.error('AuthProvider init error:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
