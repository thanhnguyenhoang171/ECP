'use client';

import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '@/store/authStore';
import { getApiErrorMessage, ErrorMessages } from '@/constants/errorMessages';
import { decodeJwtToken, extractRolesFromToken } from '@/lib/jwt';
import { LoginResponse, RegisterResponse, LogoutResponse, User, UserAccountData } from '../types/auth.interface';

const fetchAccountInfoInBackground = (
  accessToken: string,
  initialProfile: User,
  setAuth: (token: string, user: User) => void
): void => {
  authApi
    .getAccountInfo()
    .then((accountRes) => {
      const accountData: UserAccountData | undefined = accountRes?.data;
      if (!accountData) {
        return;
      }

      const rolesFromAccount = accountData.roles || initialProfile.roles || [];
      const firstNameStr = accountData.firstName || '';
      const lastNameStr = accountData.lastName || '';
      const fullNameStr = lastNameStr ? `${lastNameStr} ${firstNameStr}`.trim() : firstNameStr;

      const updatedProfile: User = {
        id: accountData.id || initialProfile.id,
        email: accountData.email || initialProfile.email,
        roles: rolesFromAccount,
        firstName: firstNameStr,
        lastName: lastNameStr,
        fullName: fullNameStr,
        phone: accountData.phoneNumber || accountData.phone || null,
        phoneNumber: accountData.phoneNumber || accountData.phone || null,
        avatarUrl: accountData.avatarUrl || null,
        avatarPublicId: accountData.avatarPublicId || null,
        dob: accountData.dob || null,
        gender: accountData.gender || null,
        createdAt: accountData.createdAt || '',
        updatedAt: accountData.updatedAt || '',
        phoneVerified: Boolean(accountData.phoneVerified),
        emailVerified: Boolean(accountData.emailVerified),
        active: Boolean(accountData.active),
      };

      setAuth(accessToken, updatedProfile);
    })
    .catch((err: unknown) => {
      console.error('[auth-mutation] Background account info fetch failed:', err);
    });
};

export function useLogin(): UseMutationResult<LoginResponse, unknown, Parameters<typeof authApi.login>[0]> {
  const router = useRouter();
  const { setAuth, updateAccessToken, clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (result) => {
      const { accessToken } = result.data;

      // 1. Store temporary accessToken
      updateAccessToken(accessToken);

      // 2. Extract user claims and roles directly from JWT token for instant authorization check
      const decodedPayload = decodeJwtToken(accessToken);
      const rolesArray = extractRolesFromToken(accessToken);

      const isRestricted =
        (rolesArray.includes('USER') || rolesArray.includes('ROLE_USER')) &&
        !rolesArray.some((r: string) => r.includes('SUPER_ADMIN') || r.includes('ADMIN') || r.includes('MANAGER'));

      if (isRestricted) {
        authApi.logout(accessToken).catch((e: unknown) => {
          console.error('[useLogin] Failed to logout restricted account:', e);
        });
        clearAuth();
        toast.error(ErrorMessages['AUTH_ACCESS_DENIED'], { id: 'auth-access-denied' });
        return;
      }

      // 3. Construct initial user profile from JWT token claims
      const initialProfile: User = {
        id: (decodedPayload?.id || decodedPayload?.userId || decodedPayload?.sub || '') as string,
        email: (decodedPayload?.email || '') as string,
        roles: rolesArray,
      };

      // 4. Set authentication state and redirect immediately without blocking UI
      setAuth(accessToken, initialProfile);
      toast.success('Đăng nhập thành công!');

      router.refresh();
      router.push('/dashboard');

      // 5. Fetch complete user profile in the background
      fetchAccountInfoInBackground(accessToken, initialProfile, setAuth);
    },
    onError: (error: unknown) => {
      console.error('[useLogin] Login mutation failed:', error);
      const message = getApiErrorMessage(error, 'Đăng nhập thất bại, vui lòng thử lại.');
      toast.error(message, { id: message });
    },
  });
}

export function useRegister(): UseMutationResult<RegisterResponse, unknown, Parameters<typeof authApi.register>[0]> {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      router.push('/login');
    },
    onError: (error: unknown) => {
      console.error('[useRegister] Registration mutation failed:', error);
      const message = getApiErrorMessage(error, 'Đăng ký thất bại, vui lòng thử lại.');
      toast.error(message, { id: message });
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
    onSuccess: (result) => {
      const { accessToken } = result.data;

      // 1. Store temporary accessToken
      updateAccessToken(accessToken);

      // 2. Extract user claims and roles directly from JWT token for instant authorization check
      const decodedPayload = decodeJwtToken(accessToken);
      const rolesArray = extractRolesFromToken(accessToken);

      const isRestricted =
        (rolesArray.includes('USER') || rolesArray.includes('ROLE_USER')) &&
        !rolesArray.some((r: string) => r.includes('SUPER_ADMIN') || r.includes('ADMIN') || r.includes('MANAGER'));

      if (isRestricted) {
        authApi.logout(accessToken).catch((e: unknown) => {
          console.error('[useGoogleLogin] Failed to logout restricted account:', e);
        });
        clearAuth();
        toast.error(ErrorMessages['AUTH_ACCESS_DENIED'], { id: 'auth-access-denied' });
        return;
      }

      // 3. Construct initial user profile from JWT token claims
      const initialProfile: User = {
        id: (decodedPayload?.id || decodedPayload?.userId || decodedPayload?.sub || '') as string,
        email: (decodedPayload?.email || '') as string,
        roles: rolesArray,
      };

      // 4. Set authentication state and redirect immediately without blocking UI
      setAuth(accessToken, initialProfile);
      toast.success('Đăng nhập Google thành công!');

      router.refresh();
      router.push('/dashboard');

      // 5. Fetch complete user profile in the background
      fetchAccountInfoInBackground(accessToken, initialProfile, setAuth);
    },
    onError: (error: unknown) => {
      console.error('[useGoogleLogin] Google login failed:', error);
      const message = getApiErrorMessage(error, 'Đăng nhập Google thất bại, vui lòng thử lại.');
      toast.error(message, { id: message });
    },
  });
}
