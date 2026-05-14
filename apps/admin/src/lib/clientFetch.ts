import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090/api';

export const clientFetch = async (url: string, options: RequestInit = {}) => {
  const { accessToken, setAuth, clearAuth } = useAuthStore.getState();
  const headers = new Headers(options.headers);
  
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

  let response = await fetch(finalUrl, { ...options, headers });

  // Handle Access Token expiration (401)
  if (response.status === 401) {
    // Try to refresh token via Next.js API Route (Must use absolute URL on server)
    const refreshRes = await fetch(`${APP_URL}/api/auth/refresh`, { method: 'POST' });
    
    if (refreshRes.ok) {
      const result = await refreshRes.json();
      if (result.success && result.data) {
        const { accessToken: newAccessToken, user } = result.data;
        
        // Update new token in Zustand
        setAuth(newAccessToken, user);
        
        // Retry the original request with new token
        headers.set('Authorization', `Bearer ${newAccessToken}`);
        response = await fetch(finalUrl, { ...options, headers });
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

  // Handle Forbidden (403)
  if (response.status === 403) {
    toast.error('Bạn không có quyền thực hiện hành động này.');
  }
  
  return response;
};
