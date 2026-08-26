import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { getErrorMessage, ErrorMessages } from '@/constants/errorMessages';

const getAdminBackendUrl = (): string => {
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
    cleanPath.startsWith('v1/users/me') ||
    cleanPath.startsWith('v1/files') ||
    cleanPath.startsWith('v1/admin/') || 
    cleanPath.startsWith('v1/manager/') || 
    cleanPath.startsWith('v1/common/') || 
    cleanPath.startsWith('v1/auth/')
  ) {
    return cleanPath;
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

let refreshTokenPromise: Promise<string | null> | null = null;

const getRefreshedAccessToken = async (APP_URL: string): Promise<string | null> => {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = (async () => {
    try {
      const refreshRes = await fetch(`${APP_URL}/api/auth/refresh`, { method: 'POST' });
      if (refreshRes.ok) {
        const result = await refreshRes.json();
        if (result.success && result.data?.accessToken) {
          const newAccessToken = result.data.accessToken;
          useAuthStore.getState().updateAccessToken(newAccessToken);
          return newAccessToken;
        }
      }
      useAuthStore.getState().clearAuth();
      return null;
    } catch (e) {
      console.error('[clientFetch] Failed to refresh token:', e);
      useAuthStore.getState().clearAuth();
      return null;
    } finally {
      refreshTokenPromise = null;
    }
  })();

  return refreshTokenPromise;
};

export const clientFetch = async (url: string, options: FetchOptions = {}) => {
  const { skipToast, ...fetchOptions } = options;
  const { accessToken, clearAuth, isBlocked, incrementErrorCount } = useAuthStore.getState();

  if (isBlocked) {
    console.log('User blocked due to consecutive server errors. Redirecting to login page...');
    if (typeof window !== 'undefined') {
      fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
        window.location.href = '/login';
      });
    }
    return new Response(JSON.stringify({ error: 'System temporarily unavailable due to consecutive internal errors.' }), {
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
    // Handle network connection or unreachable backend errors
    console.error('Fetch error:', error);
    if (!skipToast) {
      toast.error('Unable to connect to the server. Please check your network connection.');
    }
    throw error;
  }

  // Handle Access Token expiration (401) with Mutex Lock to prevent race conditions
  if (response.status === 401 && !url.includes('/api/auth/refresh')) {
    const newAccessToken = await getRefreshedAccessToken(APP_URL);
    
    if (newAccessToken) {
      // Retry original request with refreshed access token
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      response = await fetch(finalUrl, { ...fetchOptions, headers });
    } else {
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
        toast.error('Your access permissions have been updated. Please log in again.');
        window.location.href = '/login';
      });
    }
  }

  // Handle 500+ Internal Server Errors
  if (response.status >= 500) {
    incrementErrorCount();
    
    // Check error thresholds after incrementing
    const updatedState = useAuthStore.getState();
    console.log(`Internal Server Error detected. Current error count: ${updatedState.errorCount}, isBlocked: ${updatedState.isBlocked}`);
    
    if (updatedState.isBlocked) {
      clearAuth();
      if (typeof window !== 'undefined') {
        toast.error(ErrorMessages['SYS_TOO_MANY_ERRORS']);
        
        // Clear auth cookies to prevent middleware redirect loops
        fetch('/api/auth/logout', { method: 'POST' });

        // Delay redirect briefly for toast visibility
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } else if (!skipToast) {
      toast.error(ErrorMessages['SYS_INTERNAL_ERROR']);
    }
  }

  // Handle global business error codes when response fails
  if (!response.ok && response.status !== 401 && !skipToast) {
    try {
      // Clone response to preserve stream reading for component callers
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      
      const businessCode = data?.error?.code || data?.errorCode || data?.code;
      const serverMessage = data?.message || data?.error?.message || data?.error;

      if (businessCode || serverMessage) {
        const errorMsg = getErrorMessage(
          businessCode, 
          typeof serverMessage === 'string' ? serverMessage : undefined
        );
        toast.error(errorMsg);
      } else {
        // Fallback HTTP status code handling
        if (response.status === 403) {
          toast.error(ErrorMessages['AUTH_ACCESS_DENIED']);
        } else if (response.status < 500) {
          toast.error(ErrorMessages['SYS_UNKNOWN_ERROR']);
        }
      }
    } catch {
      // Fallback for non-JSON error responses
      if (response.status === 403) {
        toast.error(ErrorMessages['AUTH_ACCESS_DENIED']);
      } else if (response.status < 500) {
        toast.error(ErrorMessages['SYS_UNKNOWN_ERROR']);
      }
    }
  }
  
  return response;
};
