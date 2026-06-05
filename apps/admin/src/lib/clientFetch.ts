import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { getErrorMessage, ErrorMessages } from '@/constants/errorMessages';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090/api';

export interface FetchOptions extends RequestInit {
  skipToast?: boolean;
}

export const clientFetch = async (url: string, options: FetchOptions = {}) => {
  const { skipToast, ...fetchOptions } = options;
  const { accessToken, setAuth, clearAuth, isBlocked, incrementErrorCount } = useAuthStore.getState();

  // 1. Kiểm tra nếu đang bị block do lỗi server quá nhiều
  if (isBlocked) {
    console.log('Người dùng bị chặn do gặp quá nhiều lỗi server. Đang chuyển hướng về trang đăng nhập...');
    if (typeof window !== 'undefined') {
      // Clear cookies as well to prevent middleware from redirecting back
      fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
        window.location.href = '/login';
      });
    }
    return new Response(JSON.stringify({ error: 'Hệ thống tạm thời không khả dụng do gặp liên tiếp nhiều lỗi nội bộ.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const headers = new Headers(fetchOptions.headers);
  
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // Determine if it's a relative URL (Next.js API route) or absolute (Backend)
  const isRelative = url.startsWith('/');
  
  // Use absolute URL for server-side or if base is needed
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  
  const finalUrl = isRelative 
    ? (url.startsWith('http') ? url : `${APP_URL}${url}`) 
    : `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;

  let response: Response;
  try {
    response = await fetch(finalUrl, { ...fetchOptions, headers });
  } catch (error) {
    // Xử lý lỗi kết nối mạng hoặc lỗi khác không có response
    console.error('Fetch error:', error);
    throw error;
  }

  // Handle Access Token expiration (401)
  if (response.status === 401) {
    // Try to refresh token via Next.js API Route (Must use absolute URL on server)
    const refreshRes = await fetch(`${APP_URL}/api/auth/refresh`, { method: 'POST' });
    
    if (refreshRes.ok) {
      const result = await refreshRes.json();
      if (result.success && result.data) {
        const { accessToken: newAccessToken, username, email, roles } = result.data;
        
        // Update new token in Zustand
        setAuth(newAccessToken, { username, email, roles });
        
        // Retry the original request with new token
        headers.set('Authorization', `Bearer ${newAccessToken}`);
        response = await fetch(finalUrl, { ...fetchOptions, headers });
      } else {
        clearAuth();
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
      }
    } else {
      // Refresh Token expired or invalid -> Logout
      clearAuth();
      if (typeof window !== 'undefined') {
          window.location.href = '/login';
      }
    }
  }

  // 2. Kiểm tra lỗi 500 (Internal Server Error)
  if (response.status >= 500) {
    incrementErrorCount();
    
    // Kiểm tra lại sau khi increment xem đã đạt giới hạn chưa
    const updatedState = useAuthStore.getState();
    console.log(`Internal Server Error detected. Current error count: ${updatedState.errorCount}, isBlocked: ${updatedState.isBlocked}`);
    
    if (updatedState.isBlocked) {
      clearAuth(); // Xóa auth state
      if (typeof window !== 'undefined') {
        toast.error(ErrorMessages["SYS_TOO_MANY_ERRORS"]);
        
        // Clear cookies as well to prevent middleware from redirecting back
        fetch('/api/auth/logout', { method: 'POST' });

        // Chờ một chút để toast hiển thị trước khi redirect
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } else if (!skipToast) {
      // Nếu chưa bị block thì toast lỗi server bình thường
      toast.error(ErrorMessages["SYS_INTERNAL_ERROR"]);
    }
  }

  // Xử lý Global Business Error Code khi response không thành công
  if (!response.ok && response.status !== 401 && !skipToast) {
    try {
      // Clone response để không ảnh hưởng đến việc đọc json ở các component gọi hàm này
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      
      // Hỗ trợ nhiều định dạng code phổ biến (tùy BE cấu hình)
      const businessCode = data?.error?.code || data?.errorCode || data?.code;

      if (businessCode) {
        toast.error(getErrorMessage(businessCode));
      } else {
        // Fallback xử lý theo HTTP Status nếu không có mã code từ BE
        if (response.status === 403) {
          toast.error(ErrorMessages["AUTH_ACCESS_DENIED"]);
        } else if (response.status >= 500) {
          // Đã xử lý toast ở trên rồi, không làm gì ở đây để tránh duplicate toast
        } else {
          toast.error(ErrorMessages["SYS_UNKNOWN_ERROR"]);
        }
      }
    } catch (e) {
      // Nếu API trả về lỗi nhưng không phải JSON
      if (response.status === 403) {
        toast.error(ErrorMessages["AUTH_ACCESS_DENIED"]);
      } else if (response.status >= 500) {
        // Đã xử lý toast ở trên rồi
      } else {
        toast.error(ErrorMessages["SYS_UNKNOWN_ERROR"]);
      }
    }
  }
  
  return response;
};
