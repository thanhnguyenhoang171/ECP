'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { authApi } from '@/features/auth/api/auth.api';
import { User, UserAccountData } from '@/features/auth/types/auth.interface';

export default function AuthProvider({ children }: { readonly children: React.ReactNode }): React.ReactElement {
  const { setAuth, clearAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      // Execute refresh check only during app initialization (page reload/F5)
      // Skip execution on authentication pages (/login or /register)
      if (pathname === '/login' || pathname === '/register') {
        setIsInitializing(false);
        return;
      }

      try {
        const result = await authApi.refresh();

        if (result.success) {
          const { id, accessToken, email, roles } = result.data;
          let userProfile: User = { id, email, roles: roles || [] };

          try {
            const accountRes = await authApi.getAccountInfo();
            const accountData: UserAccountData | undefined = accountRes?.data;
            if (accountData) {
              const firstNameStr = accountData.firstName || '';
              const lastNameStr = accountData.lastName || '';
              const fullNameStr = lastNameStr ? `${lastNameStr} ${firstNameStr}`.trim() : firstNameStr;

              userProfile = {
                id: accountData.id || id,
                email: accountData.email || email,
                roles: accountData.roles || roles || [],
                firstName: firstNameStr,
                lastName: lastNameStr,
                fullName: fullNameStr,
                phone: accountData.phoneNumber || accountData.phone || null,
                phoneNumber: accountData.phoneNumber || accountData.phone || null,
                avatarUrl: accountData.avatarUrl || null,
              };
            }
          } catch (fetchErr) {
            console.error('[AuthProvider] Failed to retrieve account info:', fetchErr);
          }

          setAuth(accessToken, userProfile);
        }
      } catch (error: unknown) {
        const err = error as { status?: number };
        if (err.status === 401) {
          // Clear authentication state only when server confirms token is invalid
          clearAuth();
        }
        console.error('[AuthProvider] Auth initialization failed:', error);
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
