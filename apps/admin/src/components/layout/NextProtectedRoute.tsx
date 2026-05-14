'use client';
import React, { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/store/authStore';

const emptySubscribe = () => () => {};

export default function NextProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    // Chỉ kiểm tra quyền sau khi đã load xong dữ liệu từ storage (hydration)
    if (isClient && hasHydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isClient, hasHydrated, isAuthenticated, router]);

  // Trong lúc đang chờ hydration hoặc render server-side, không render children để tránh lộ thông tin
  if (!isClient || !hasHydrated) return null;
  
  // Nếu đã hydrated nhưng chưa login, useEffect ở trên sẽ redirect, ở đây return null
  if (!isAuthenticated) return null;

  return <>{children}</>;
}

