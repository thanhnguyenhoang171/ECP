'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const getAdminBackendUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL;
  return (envUrl && envUrl.startsWith('http')) ? envUrl : 'http://localhost:9090/api';
};
const API_URL = getAdminBackendUrl();

/**
 * Module-level flag — persists across StrictMode unmount/remount cycles,
 * ensuring initialization runs exactly once even if React re-invokes effects in development.
 */
let initialized = false;

export default function AuthInitializer(): null {
  const { setAuth, updateAccessToken, clearAuth, setInitialized, hasHydrated } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    // Skip refresh API execution on login and register pages
    if (pathname === '/login' || pathname === '/register') {
      setInitialized(true);
      return;
    }

    // Wait for zustand store hydration from localStorage before attempting token refresh
    if (!hasHydrated) {
      return;
    }

    // Module-level guard to prevent duplicated initialization calls
    if (initialized) {
      return;
    }
    initialized = true;

    const initialize = async (): Promise<void> => {
      const APP_URL = window.location.origin;
      try {
        // Step 1: Request new accessToken via HTTP-only refreshToken cookie
        const refreshRes = await fetch(`${APP_URL}/api/auth/refresh`, {
          method: 'POST',
        });

        if (!refreshRes.ok) {
          // Token expired or missing cookie -> clear auth state
          clearAuth();
          setInitialized(true);
          return;
        }

        const refreshData = await refreshRes.json();
        if (!refreshData.success || !refreshData.data?.accessToken) {
          clearAuth();
          setInitialized(true);
          return;
        }

        const { accessToken } = refreshData.data;

        // Step 2: Temporarily store accessToken for subsequent API calls
        updateAccessToken(accessToken);

        // Step 3: Fetch full user account details from /v1/users/me via proxy
        const accountRes = await fetch('/api/proxy/v1/users/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!accountRes.ok) {
          // Token valid but profile call failed -> retain basic session
          setInitialized(true);
          return;
        }

        const accountData = await accountRes.json();
        const profile = accountData?.data || accountData;

        // Step 4: Hydrate store with complete user account details
        setAuth(accessToken, {
          id: profile.id,
          email: profile.email,
          roles: profile.roles || (profile.role ? [profile.role] : []),
          firstName: profile.firstName,
          lastName: profile.lastName,
          fullName: profile.fullName || (profile.lastName ? `${profile.lastName} ${profile.firstName || ''}`.trim() : profile.firstName),
          phone: profile.phoneNumber || profile.phone,
          phoneNumber: profile.phoneNumber || profile.phone,
          avatarUrl: profile.avatarUrl,
          avatarPublicId: profile.avatarPublicId,
          dob: profile.dob,
          gender: profile.gender,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
          phoneVerified: profile.phoneVerified,
          emailVerified: profile.emailVerified,
          active: profile.active,
        });
      } catch (err) {
        console.error('[AuthInitializer] Session initialization failed:', err);
        clearAuth();
      } finally {
        setInitialized(true);
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  // Non-rendering component that manages authentication lifecycle side effects
  return null;
}
