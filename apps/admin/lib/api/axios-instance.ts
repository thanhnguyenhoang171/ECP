import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data as { message?: string } | undefined;

    if (typeof window !== "undefined") {
      switch (status) {
        case 401:
          console.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
          localStorage.removeItem("access_token");
          // window.location.href = "/login";
          break;
        case 403:
          console.error("Bạn không có quyền thực hiện hành động này!");
          break;
        default:
          console.error(data?.message || "Đã có lỗi xảy ra, vui lòng thử lại!");
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
