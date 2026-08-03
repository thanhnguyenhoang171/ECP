'use client';
import React, { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/store/authStore';
import { Forbidden } from '@/components/common';

const emptySubscribe = () => () => {};

export default function NextProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, hasHydrated, isInitialized, user } = useAuthStore();
  
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    // Chỉ kiểm tra quyền sau khi đã hydrate từ storage VÀ AuthInitializer đã chạy xong
    if (isClient && hasHydrated && isInitialized && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isClient, hasHydrated, isInitialized, isAuthenticated, router]);

  // Chờ hydration từ localStorage và AuthInitializer (refresh + fetch profile) hoàn tất
  if (!isClient || !hasHydrated || !isInitialized) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-slate-500">Đang khởi tạo phiên...</p>
        </div>
      </div>
    );
  }

  // Nếu đã initialized nhưng chưa login, useEffect ở trên sẽ redirect, ở đây return null
  if (!isAuthenticated) return null;

  // Chặn người dùng có role là USER truy cập vào admin
  const isRestricted = user?.roles?.includes('ROLE_USER') && 
                     !user?.roles?.includes('ROLE_SUPER_ADMIN') && 
                     !user?.roles?.includes('ROLE_MANAGER');

  if (isRestricted) {
    return <Forbidden />;
  }

  return <>{children}</>;
}

