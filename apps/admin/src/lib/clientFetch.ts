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
  return path.startsWith('/') ? path.slice(1) : path;
}

let refreshTokenPromise: Promise<string | null> | null = null;

export const getRefreshedAccessToken = async (APP_URL: string): Promise<string | null> => {
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
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  
  const isAuthEndpoint = url.includes('/api/auth/') || url.includes('/login') || url.includes('/register');
  let currentToken = useAuthStore.getState().accessToken;
  const isInitialized = useAuthStore.getState().isInitialized;

  // On page refresh before auth store is initialized, wait for session refresh if token is not in memory
  if (!currentToken && !isInitialized && !isAuthEndpoint && typeof window !== 'undefined') {
    currentToken = await getRefreshedAccessToken(APP_URL);
  }

  const { clearAuth, isBlocked, incrementErrorCount } = useAuthStore.getState();

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
  
  if (currentToken) {
    headers.set('Authorization', `Bearer ${currentToken}`);
  }
  
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
      toast.error(ErrorMessages['SYS_NETWORK_ERROR'], { id: 'network-fetch-error' });
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

  // Handle Forbidden access (403): User is authenticated but lacks permission for this action/resource
  if (response.status === 403) {
    console.warn(`[clientFetch] 403 Forbidden: User does not have permission for ${url}`);
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
        toast.error(ErrorMessages['SYS_TOO_MANY_ERRORS'], { id: 'sys-too-many-errors' });
        
        // Clear auth cookies to prevent middleware redirect loops
        fetch('/api/auth/logout', { method: 'POST' });

        // Delay redirect briefly for toast visibility
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } else if (!skipToast) {
      toast.error(ErrorMessages['SYS_INTERNAL_ERROR'], { id: 'sys-internal-error' });
    }
  }

  // Handle global business error codes when response fails
  if (!response.ok && response.status !== 401 && !skipToast) {
    try {
      // Clone response to preserve stream reading for component callers
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      
      const businessCode = data?.code || data?.error?.code || data?.errorCode;
      const serverMessage = data?.message || data?.error?.message || data?.error;

      if (businessCode || serverMessage) {
        const errorMsg = getErrorMessage(
          businessCode, 
          typeof serverMessage === 'string' ? serverMessage : undefined
        );
        toast.error(errorMsg, { id: errorMsg });
      } else {
        // Fallback HTTP status code handling
        if (response.status === 403) {
          toast.error(ErrorMessages['AUTH_ACCESS_DENIED'], { id: 'auth-access-denied' });
        } else if (response.status < 500) {
          toast.error(ErrorMessages['SYS_UNKNOWN_ERROR'], { id: 'sys-unknown-error' });
        }
      }
    } catch {
      // Fallback for non-JSON error responses
      if (response.status === 403) {
        toast.error(ErrorMessages['AUTH_ACCESS_DENIED'], { id: 'auth-access-denied' });
      } else if (response.status < 500) {
        toast.error(ErrorMessages['SYS_UNKNOWN_ERROR'], { id: 'sys-unknown-error' });
      }
    }
  }
  
  return response;
};
