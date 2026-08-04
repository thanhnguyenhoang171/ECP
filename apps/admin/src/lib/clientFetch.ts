import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { getErrorMessage, ErrorMessages } from '@/constants/errorMessages';

const getAdminBackendUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL;
  return (envUrl && envUrl.startsWith('http')) ? envUrl : 'http://localhost:9090/api';
};
const API_URL = getAdminBackendUrl();

export interface FetchOptions extends RequestInit {
  skipToast?: boolean;
}

export function resolveRolePath(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (
    cleanPath.startsWith('v1/admin/') || 
    cleanPath.startsWith('v1/manager/') || 
    cleanPath.startsWith('v1/common/') || 
    cleanPath.startsWith('v1/auth/')
  ) {
    return cleanPath;
  }

  if (cleanPath === 'v1/users/account') {
    return 'v1/common/users/account';
  }

  const { user } = useAuthStore.getState();
  const role = user?.role || (user?.roles && user.roles[0]) || '';
  const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'ROLE_SUPER_ADMIN';
  const scope = isSuperAdmin ? 'admin' : 'manager';

  if (cleanPath.startsWith('v1/audit-logs')) {
    if (isSuperAdmin) {
      return cleanPath.replace('v1/audit-logs', 'v1/admin/audit-logs');
    } else {
      const email = user?.email || '';
      return `v1/manager/audit-logs/user/${email}`;
    }
  }

  if (cleanPath.startsWith('v1/files')) {
    return cleanPath.replace('v1/files', 'v1/common/files');
  }

  const resources = [
    'brands', 'categories', 'products', 'skus', 'suppliers',
    'warehouses', 'inventory', 'purchase-orders', 'goods-receipts', 'users'
  ];

  for (const res of resources) {
    if (cleanPath.startsWith(`v1/${res}`)) {
      return cleanPath.replace(`v1/${res}`, `v1/${scope}/${res}`);
    }
  }

  return cleanPath;
}

export const clientFetch = async (url: string, options: FetchOptions = {}) => {
  const { skipToast, ...fetchOptions } = options;
  const { accessToken, setAuth, updateAccessToken, clearAuth, isBlocked, incrementErrorCount } = useAuthStore.getState();

  if (isBlocked) {
    console.log('Người dùng bị chặn do gặp quá nhiều lỗi server. Đang chuyển hướng về trang đăng nhập...');
    if (typeof window !== 'undefined') {
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

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  
  let finalUrl: string;
  if (url.startsWith('http')) {
    finalUrl = url;
  } else if (url.startsWith('/api/')) {
    finalUrl = `${APP_URL}${url}`;
  } else {
    const resolvedPath = resolveRolePath(url);
    if (typeof window !== 'undefined') {
      finalUrl = `/api/proxy/${resolvedPath}`;
    } else {
      finalUrl = `${API_URL}/${resolvedPath}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(finalUrl, { ...fetchOptions, headers });
  } catch (error) {
    // Xử lý lỗi kết nối mạng hoặc lỗi khác không có response
    console.error('Fetch error:', error);
    if (!skipToast) {
      toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền hoặc máy chủ backend.");
    }
    throw error;
  }

  // Handle Access Token expiration (401)
  if (response.status === 401) {
    // Try to refresh token via Next.js API Route (Must use absolute URL on server)
    const refreshRes = await fetch(`${APP_URL}/api/auth/refresh`, { method: 'POST' });
    
    if (refreshRes.ok) {
      const result = await refreshRes.json();
      if (result.success && result.data) {
        const { accessToken: newAccessToken } = result.data;
        
        // Chỉ cập nhật accessToken, giữ nguyên thông tin user (đã persist trong localStorage)
        updateAccessToken(newAccessToken);
        
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

  // Handle Forbidden access / Role revoked (403)
  if (response.status === 403) {
    console.warn('[clientFetch] 403 Forbidden detected. Access rights changed, logging out...');
    clearAuth();
    if (typeof window !== 'undefined') {
      fetch(`${APP_URL}/api/auth/logout`, { method: 'POST' }).finally(() => {
        toast.error('Quyền truy cập của tài khoản đã bị thay đổi. Vui lòng đăng nhập lại.');
        window.location.href = '/login';
      });
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
      
      // Hỗ trợ nhiều định dạng code & message phổ biến từ BE
      const businessCode = data?.error?.code || data?.errorCode || data?.code;
      const serverMessage = data?.message || data?.error?.message || data?.error;

      if (businessCode || serverMessage) {
        const errorMsg = getErrorMessage(
          businessCode, 
          typeof serverMessage === 'string' ? serverMessage : undefined
        );
        toast.error(errorMsg);
      } else {
        // Fallback xử lý theo HTTP Status nếu không có mã code từ BE
        if (response.status === 403) {
          toast.error(ErrorMessages["AUTH_ACCESS_DENIED"]);
        } else if (response.status < 500) {
          toast.error(ErrorMessages["SYS_UNKNOWN_ERROR"]);
        }
      }
    } catch {
      // Nếu API trả về lỗi nhưng không phải JSON
      if (response.status === 403) {
        toast.error(ErrorMessages["AUTH_ACCESS_DENIED"]);
      } else if (response.status < 500) {
        toast.error(ErrorMessages["SYS_UNKNOWN_ERROR"]);
      }
    }
  }
  
  return response;
};
