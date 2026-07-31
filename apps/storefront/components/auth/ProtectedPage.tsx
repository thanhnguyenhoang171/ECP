'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface ProtectedPageProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Bọc xung quanh bất kỳ trang nào cần đăng nhập.
 * - isLoading = true  → Hiển thị fallback (hoặc skeleton loading mặc định)
 * - isAuthenticated = false → Redirect về /login
 * - isAuthenticated = true  → Render children bình thường
 */
export default function ProtectedPage({ children, fallback }: ProtectedPageProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Đang kiểm tra session (AuthInitializer đang chạy)
  if (isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          {/* Logo skeleton */}
          <div className="w-10 h-10 rounded-xl bg-[#F5C542] flex items-center justify-center mx-auto animate-pulse">
            <span className="text-[#1E1B18] font-bold text-sm">C</span>
          </div>
          {/* Spinner */}
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-zinc-200 border-t-[#F5C542] rounded-full animate-spin" />
          </div>
          <p className="text-xs text-zinc-400 font-medium">Đang xác thực phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập — render null trong khi đợi redirect
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
