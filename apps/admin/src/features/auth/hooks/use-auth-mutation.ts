'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/constants/errorMessages';

export function useLogin() {
  const router = useRouter();
  const { setAuth, updateAccessToken, clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (result) => {
      const { accessToken } = result.data as any;
      
      // 1. Lưu tạm accessToken để có thể gọi API /v1/users/account
      updateAccessToken(accessToken);

      let accountData: any = null;
      try {
        // 2. Gọi API /v1/users/account lấy hồ sơ user chuẩn từ token
        const accountRes = await authApi.getAccountInfo();
        accountData = accountRes?.data || accountRes;
      } catch (err) {
        console.error('Lỗi lấy thông tin tài khoản từ API /users/account:', err);
      }

      if (!accountData) {
        toast.error('Không thể lấy thông tin tài khoản. Vui lòng thử lại.');
        return;
      }

      const userProfile = {
        id: accountData?.id,
        email: accountData?.email,
        roles: accountData?.roles || (accountData?.role ? [`ROLE_${accountData.role}`] : []),
        firstName: accountData?.firstName,
        lastName: accountData?.lastName,
        avatarUrl: accountData?.avatarUrl,
      };
      const finalRoles = userProfile.roles || [];
      const isRestricted = finalRoles.includes('ROLE_USER') && 
                         !finalRoles.includes('ROLE_SUPER_ADMIN') && 
                         !finalRoles.includes('ROLE_MANAGER');

      if (isRestricted) {
        try {
          await authApi.logout(accessToken);
        } catch (e) {
          console.error('[useLogin] Lỗi khi đăng xuất tài khoản không có quyền:', e);
        }
        clearAuth();
        toast.error('Tài khoản của bạn không có quyền truy cập hệ thống quản trị');
        return;
      }

      // 3. setAuth với đầy đủ thông tin
      setAuth(accessToken, userProfile);
      toast.success('Chào mừng bạn quay trở lại!');
      
      router.refresh();
      router.push('/dashboard');
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      const message = error.code ? getErrorMessage(error.code) : 'Đăng nhập thất bại, vui lòng thử lại';
      toast.error(message);
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      router.push('/login');
    },
    onError: (error: any) => {
      console.error('Register error:', error);
      const message = error.code ? getErrorMessage(error.code) : 'Đăng ký thất bại, vui lòng thử lại';
      toast.error(message);
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const { clearAuth, accessToken } = useAuthStore();

  return useMutation({
    mutationFn: () => authApi.logout(accessToken || undefined),
    onSuccess: () => {
      clearAuth();
      router.push('/login');
    },
    onError: () => {
      // Still clear auth and redirect even if logout API fails
      clearAuth();
      router.push('/login');
    },
  });
}

export function useGoogleLogin() {
  const router = useRouter();
  const { setAuth, updateAccessToken, clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: authApi.googleLogin,
    onSuccess: async (result) => {
      const { accessToken } = result.data as any;

      // 1. Lưu tạm accessToken để có thể gọi API /v1/users/account
      updateAccessToken(accessToken);

      let accountData: any = null;
      try {
        // 2. Gọi API /v1/users/account lấy hồ sơ user chuẩn từ token
        const accountRes = await authApi.getAccountInfo();
        accountData = accountRes?.data || accountRes;
      } catch (err) {
        console.error('Lỗi lấy thông tin tài khoản từ API /users/account:', err);
      }

      const userProfile = {
        id: accountData?.id,
        email: accountData?.email,
        roles: accountData?.roles || (accountData?.role ? [`ROLE_${accountData.role}`] : []),
        firstName: accountData?.firstName,
        lastName: accountData?.lastName,
        avatarUrl: accountData?.avatarUrl,
      };

      const finalRoles = userProfile.roles || [];
      const isRestricted = finalRoles.includes('ROLE_USER') && 
                         !finalRoles.includes('ROLE_SUPER_ADMIN') && 
                         !finalRoles.includes('ROLE_MANAGER');

      if (isRestricted) {
        try {
          await authApi.logout(accessToken);
        } catch (e) {
          console.error('[GoogleLogin] Lỗi khi đăng xuất tài khoản không có quyền:', e);
        }
        clearAuth();
        toast.error('Tài khoản của bạn không có quyền truy cập hệ thống quản trị');
        return;
      }

      // 3. setAuth với đầy đủ thông tin
      setAuth(accessToken, userProfile);
      toast.success('Đăng nhập bằng Google thành công!');
      
      router.refresh();
      router.push('/dashboard');
    },
    onError: (error: any) => {
      console.error('Google login error:', error);
      const message = error.message || 'Đăng nhập Google thất bại, vui lòng thử lại';
      toast.error(message);
    },
  });
}
