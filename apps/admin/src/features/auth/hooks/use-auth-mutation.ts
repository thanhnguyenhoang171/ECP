'use client';

import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/constants/errorMessages';
import { LoginResponse, RegisterResponse, LogoutResponse } from '../types/auth.interface';

export function useLogin(): UseMutationResult<LoginResponse, unknown, Parameters<typeof authApi.login>[0]> {
  const router = useRouter();
  const { setAuth, updateAccessToken, clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (result) => {
      const { accessToken } = result.data;
      
      // 1. Store temporary accessToken to enable authenticated account fetch
      updateAccessToken(accessToken);

      let accountData: Record<string, unknown> | null = null;
      try {
        // 2. Fetch full user account details from /v1/users/me
        const accountRes = await authApi.getAccountInfo();
        accountData = (accountRes?.data || accountRes) as Record<string, unknown>;
      } catch (err) {
        console.error('[useLogin] Failed to fetch user account info from /v1/users/me:', err);
      }

      if (!accountData) {
        toast.error('Unable to retrieve account details. Please try again.');
        return;
      }

      const rolesArray = (accountData.roles as string[]) || (accountData.role ? [accountData.role as string] : []);
      const firstNameStr = (accountData.firstName as string) || '';
      const lastNameStr = (accountData.lastName as string) || '';

      const userProfile = {
        id: accountData.id as string,
        email: accountData.email as string,
        roles: rolesArray,
        firstName: firstNameStr,
        lastName: lastNameStr,
        fullName: (accountData.fullName as string) || (lastNameStr ? `${lastNameStr} ${firstNameStr}`.trim() : firstNameStr),
        phone: (accountData.phoneNumber as string) || (accountData.phone as string),
        phoneNumber: (accountData.phoneNumber as string) || (accountData.phone as string),
        avatarUrl: accountData.avatarUrl as string | null,
        avatarPublicId: accountData.avatarPublicId as string | null,
        dob: accountData.dob as string | null,
        gender: accountData.gender as string | null,
        createdAt: accountData.createdAt as string,
        updatedAt: accountData.updatedAt as string,
        phoneVerified: Boolean(accountData.phoneVerified),
        emailVerified: Boolean(accountData.emailVerified),
        active: Boolean(accountData.active),
      };

      const finalRoles = userProfile.roles || [];
      const isRestricted = (finalRoles.includes('USER') || finalRoles.includes('ROLE_USER')) && 
                         !finalRoles.some((r: string) => r.includes('SUPER_ADMIN') || r.includes('ADMIN') || r.includes('MANAGER'));

      if (isRestricted) {
        try {
          await authApi.logout(accessToken);
        } catch (e) {
          console.error('[useLogin] Failed to logout restricted account:', e);
        }
        clearAuth();
        toast.error('Your account does not have authorization to access the admin system.');
        return;
      }

      // 3. Hydrate authentication store with complete profile details
      setAuth(accessToken, userProfile);
      toast.success('Welcome back!');
      
      router.refresh();
      router.push('/dashboard');
    },
    onError: (error: unknown) => {
      console.error('[useLogin] Login mutation failed:', error);
      const err = error as { code?: string };
      const message = err?.code ? getErrorMessage(err.code) : 'Login failed, please try again.';
      toast.error(message);
    },
  });
}

export function useRegister(): UseMutationResult<RegisterResponse, unknown, Parameters<typeof authApi.register>[0]> {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('Account registered successfully! Please log in.');
      router.push('/login');
    },
    onError: (error: unknown) => {
      console.error('[useRegister] Registration mutation failed:', error);
      const err = error as { code?: string };
      const message = err?.code ? getErrorMessage(err.code) : 'Registration failed, please try again.';
      toast.error(message);
    },
  });
}

export function useLogout(): UseMutationResult<LogoutResponse, unknown, void> {
  const router = useRouter();
  const { clearAuth, accessToken } = useAuthStore();

  return useMutation({
    mutationFn: () => authApi.logout(accessToken || undefined),
    onSuccess: () => {
      clearAuth();
      router.push('/login');
    },
    onError: () => {
      // Clear auth state and redirect even if backend logout request fails
      clearAuth();
      router.push('/login');
    },
  });
}

export function useGoogleLogin(): UseMutationResult<LoginResponse, unknown, string> {
  const router = useRouter();
  const { setAuth, updateAccessToken, clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: authApi.googleLogin,
    onSuccess: async (result) => {
      const { accessToken } = result.data;

      // 1. Store temporary accessToken for subsequent API calls
      updateAccessToken(accessToken);

      let accountData: Record<string, unknown> | null = null;
      try {
        // 2. Fetch full user account details from /v1/users/me
        const accountRes = await authApi.getAccountInfo();
        accountData = (accountRes?.data || accountRes) as Record<string, unknown>;
      } catch (err) {
        console.error('[useGoogleLogin] Failed to fetch account info from /v1/users/me:', err);
      }

      const rolesArray = (accountData?.roles as string[]) || (accountData?.role ? [accountData.role as string] : []);
      const firstNameStr = (accountData?.firstName as string) || '';
      const lastNameStr = (accountData?.lastName as string) || '';

      const userProfile = {
        id: (accountData?.id as string) || '',
        email: (accountData?.email as string) || '',
        roles: rolesArray,
        firstName: firstNameStr,
        lastName: lastNameStr,
        fullName: (accountData?.fullName as string) || (lastNameStr ? `${lastNameStr} ${firstNameStr}`.trim() : firstNameStr),
        phone: (accountData?.phoneNumber as string) || (accountData?.phone as string),
        phoneNumber: (accountData?.phoneNumber as string) || (accountData?.phone as string),
        avatarUrl: (accountData?.avatarUrl as string) || null,
        avatarPublicId: (accountData?.avatarPublicId as string) || null,
        dob: (accountData?.dob as string) || null,
        gender: (accountData?.gender as string) || null,
        createdAt: (accountData?.createdAt as string) || '',
        updatedAt: (accountData?.updatedAt as string) || '',
        phoneVerified: Boolean(accountData?.phoneVerified),
        emailVerified: Boolean(accountData?.emailVerified),
        active: Boolean(accountData?.active),
      };

      const finalRoles = userProfile.roles || [];
      const isRestricted = (finalRoles.includes('USER') || finalRoles.includes('ROLE_USER')) && 
                         !finalRoles.some((r: string) => r.includes('SUPER_ADMIN') || r.includes('ADMIN') || r.includes('MANAGER'));

      if (isRestricted) {
        try {
          await authApi.logout(accessToken);
        } catch (e) {
          console.error('[useGoogleLogin] Failed to logout restricted account:', e);
        }
        clearAuth();
        toast.error('Your account does not have authorization to access the admin system.');
        return;
      }

      // 3. Hydrate store with complete profile
      setAuth(accessToken, userProfile);
      toast.success('Google login successful!');
      
      router.refresh();
      router.push('/dashboard');
    },
    onError: (error: unknown) => {
      console.error('[useGoogleLogin] Google login failed:', error);
      const err = error as { message?: string };
      const message = err?.message || 'Google login failed, please try again.';
      toast.error(message);
    },
  });
}
