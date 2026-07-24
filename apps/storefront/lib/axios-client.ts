'use client';

import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const REFRESH_TOKEN_COOKIE = 'ecp_refresh_token';

// ─── Queue cho các request đang chờ refresh token ─────────────────────────────
type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else if (token) {
      item.resolve(token);
    }
  });
  failedQueue = [];
}

// ─── Axios Instance ───────────────────────────────────────────────────────────
export const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── REQUEST INTERCEPTOR: Đính Bearer Token từ Zustand ────────────────────────
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy accessToken từ Zustand store (không dùng localStorage)
    if (typeof window !== 'undefined') {
      // Đọc trực tiếp từ Zustand store state (không qua hook)
      const token = useAuthStore.getState().accessToken;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR: Auto Refresh Token khi 401 ─────────────────────────
axiosClient.interceptors.response.use(
  (response) => response.data, // Trả về trực tiếp data
  async (error) => {
    const originalRequest = error.config;

    // Nếu là endpoint đăng nhập/đăng ký hoặc không phải 401 hoặc đã retry rồi → reject luôn kèm data lỗi từ server
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/register');

    if (isAuthEndpoint || error.response?.status !== 401 || originalRequest?._retry) {
      const responseData = error.response?.data;
      const errorMessage =
        responseData?.message ||
        error.message ||
        'Có lỗi xảy ra khi kết nối máy chủ.';

      const apiError = new Error(errorMessage);
      (apiError as any).code = responseData?.code;
      (apiError as any).status = error.response?.status;
      (apiError as any).data = responseData;
      return Promise.reject(apiError);
    }

    originalRequest._retry = true;

    // Nếu đang trong quá trình refresh → đẩy vào queue chờ
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosClient(originalRequest);
      });
    }

    isRefreshing = true;

    const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE);

    if (!refreshToken) {
      // Không có cookie → logout ngay
      processQueue(new Error('Phiên đăng nhập đã hết hạn.'), null);
      isRefreshing = false;

      if (typeof window !== 'undefined') {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
      }
      return Promise.reject(new Error('Phiên đăng nhập đã hết hạn.'));
    }

    try {
      // Gọi refresh bằng fetch thuần để tránh trigger interceptor này lại
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) throw new Error('Refresh thất bại');

      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Refresh thất bại');

      const newData = json.data;

      // Cập nhật store với token mới
      if (typeof window !== 'undefined') {
        useAuthStore.getState().setAuth(newData);
      }

      // Retry tất cả request trong queue với token mới
      processQueue(null, newData.accessToken);
      isRefreshing = false;

      originalRequest.headers.Authorization = `Bearer ${newData.accessToken}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      // Refresh thất bại → logout
      processQueue(refreshError, null);
      isRefreshing = false;

      if (typeof window !== 'undefined') {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    }
  }
);

// ─── Helper Upload File ────────────────────────────────────────────────────────
export async function uploadFileClient<T>(
  endpoint: string,
  formData: FormData,
  onProgress?: (percent: number) => void,
  config?: AxiosRequestConfig
): Promise<T> {
  return axiosClient.post<unknown, T>(endpoint, formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config?.headers,
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
}
