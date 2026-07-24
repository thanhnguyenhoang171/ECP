import { axiosClient } from '@/lib/axios-client';
import { AuthApiResponse, AuthData } from '@/types/user';

// ─── Payload Types ────────────────────────────────────────────────────────────

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

/**
 * Đăng nhập — POST /auth/login
 * Trả về toàn bộ AuthApiResponse để nơi gọi tự xử lý setAuth()
 */
export async function loginClient(payload: LoginPayload): Promise<AuthApiResponse> {
  return axiosClient.post<unknown, AuthApiResponse>('/auth/login', payload);
}

/**
 * Đăng ký — POST /auth/register
 * Trả về cùng cấu trúc như login nếu đăng ký thành công sẽ tự đăng nhập luôn
 */
export async function registerClient(payload: RegisterPayload): Promise<AuthApiResponse> {
  return axiosClient.post<unknown, AuthApiResponse>('/auth/register', payload);
}

/**
 * Refresh Token — POST /auth/refresh
 * Gửi refreshToken trong body, nhận accessToken + refreshToken mới.
 * Được gọi bởi: AuthInitializer (khi load trang) và axios interceptor (khi 401)
 */
export async function refreshTokenClient(refreshToken: string): Promise<AuthData> {
  // Sử dụng fetch thuần để tránh vòng lặp vô hạn với axios interceptor
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
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
 * Đăng xuất — POST /auth/logout (tùy backend)
 * Nếu backend không có endpoint này, chỉ cần gọi clearAuth() trong store là đủ.
 */
export async function logoutClient(): Promise<void> {
  try {
    await axiosClient.post('/auth/logout', {});
  } catch {
    // Bỏ qua lỗi — vẫn xóa cookie và state dù backend lỗi
  }
}
