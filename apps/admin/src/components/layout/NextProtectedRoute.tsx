'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/store/authStore';

export default function NextProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isClient, isAuthenticated, router]);

  if (!isClient) return null;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
