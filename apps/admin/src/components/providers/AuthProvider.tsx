'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      // Không gọi refresh ở các trang login/register để tránh dư thừa
      if (pathname === '/login' || pathname === '/register') {
        setIsInitializing(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/refresh', { method: 'POST' });
        const result = await response.json();

        if (response.ok && result.success) {
          setAuth(result.data.accessToken, result.data.user);
        } else {
          clearAuth();
        }
      } catch (error) {
        // Silent fail on init
        clearAuth();
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
