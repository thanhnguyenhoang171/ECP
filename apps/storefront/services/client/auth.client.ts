import { axiosClient } from '@/lib/axios-client';
import { AuthApiResponse, AuthData } from '@/types/user';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName?: string;
  email: string;
  phone?: string;
  password: string;
}

/**
 * Đăng nhập — POST /auth/login
 */
export async function loginClient(payload: LoginPayload): Promise<AuthApiResponse> {
  return axiosClient.post<unknown, AuthApiResponse>('/v1/auth/login', payload);
}

/**
 * Đăng nhập Google — POST /auth/google
 */
export async function loginGoogleClient(idToken: string): Promise<AuthApiResponse> {
  return axiosClient.post<unknown, AuthApiResponse>('/v1/auth/google', { idToken });
}

/**
 * Đăng ký — POST /auth/register
 */
export async function registerClient(payload: RegisterPayload): Promise<AuthApiResponse> {
  return axiosClient.post<unknown, AuthApiResponse>('/v1/auth/register', payload);
}

/**
 * Refresh Token — POST /auth/refresh
 */
export async function refreshTokenClient(refreshToken: string): Promise<AuthData> {
  const envUrl = process.env.NEXT_PUBLIC_STOREFRONT_API_URL || process.env.NEXT_PUBLIC_API_URL;
  const API_BASE_URL = (envUrl && envUrl.startsWith('/')) ? envUrl : '/api';
  const res = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    throw new Error('Refresh token không hợp lệ hoặc đã hết hạn.');
  }

  const json: AuthApiResponse = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Không thể làm mới phiên đăng nhập.');
  }

  return json.data;
}

/**
 * Đăng xuất — POST /auth/logout
 */
export async function logoutClient(): Promise<void> {
  try {
    await axiosClient.post('/v1/auth/logout', {});
  } catch {
    // Bỏ qua lỗi
  }
}

/**
 * Lấy thông tin tài khoản người dùng hiện tại
 */
export async function getAccountInfoClient(): Promise<any> {
  const response = await axiosClient.get('/v1/common/users/account');
  return (response as any).data || response;
}

export const getAccountInfo = getAccountInfoClient;
