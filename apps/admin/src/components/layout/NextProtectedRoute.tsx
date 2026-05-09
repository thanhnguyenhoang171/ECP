'use client';
import React, { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/store/authStore';

const emptySubscribe = () => () => {};

export default function NextProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isClient, isAuthenticated, router]);

  if (!isClient) return null;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
