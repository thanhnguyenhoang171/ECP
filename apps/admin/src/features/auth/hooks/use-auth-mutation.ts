'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/constants/errorMessages';

export function useLogin() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (result) => {
      const { id, username, email, roles, accessToken } = result.data;
      
      // Chặn người dùng có role là USER truy cập vào admin
      const isRestricted = roles.includes('ROLE_USER') && 
                         !roles.includes('ROLE_SUPER_ADMIN') && 
                         !roles.includes('ROLE_MANAGER');

      if (isRestricted) {
        toast.error('Tài khoản của bạn không có quyền truy cập hệ thống quản trị');
        return;
      }

      setAuth(accessToken, { id, username, email, roles });
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
