import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';

// Bạn sẽ cấu hình URL của Backend trong file .env
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Bộ chặn trước khi gửi Request
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy token từ localStorage (hoặc store của bạn)
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Bộ chặn khi nhận Response từ Server
axiosInstance.interceptors.response.use(
  (response) => response.data, // Trả về trực tiếp data để code gọn hơn
  (error: AxiosError) => {
    const status = error.response?.status;
    const data: any = error.response?.data;

    // Xử lý lỗi tập trung
    switch (status) {
      case 401:
        // Lỗi chưa đăng nhập hoặc token hết hạn
        message.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
        localStorage.removeItem('access_token');
        // Có thể redirect về trang login nếu cần: window.location.href = '/login';
        break;
      case 403:
        message.error('Bạn không có quyền thực hiện hành động này!');
        break;
      case 404:
        message.error('Tài nguyên không tồn tại (404)');
        break;
      case 500:
        message.error('Lỗi hệ thống từ máy chủ (500)');
        break;
      default:
        message.error(data?.message || 'Đã có lỗi xảy ra, vui lòng thử lại!');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;