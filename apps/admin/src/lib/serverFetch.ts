import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090/api';

/**
 * Hàm fetch dữ liệu tại Server có xử lý Authentication
 */
export async function serverFetch(url: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    throw new Error('No refresh token found in cookies');
  }

  // 1. Lấy Access Token mới từ Backend bằng Refresh Token
  // Chúng ta thực hiện việc này ngay tại Server để có token gọi API
  const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!refreshRes.ok) {
    throw new Error('Failed to refresh token on server');
  }

  const refreshData = await refreshRes.json();
  const accessToken = refreshData.data.accessToken;

  // 2. Gọi API thật với Access Token vừa lấy được
  const finalUrl = url.startsWith('http') ? url : `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(finalUrl, { ...options, headers });

  if (response.status === 403) {
    throw new Error('Forbidden (403): Bạn không có quyền truy cập tài nguyên này.');
  }

  return response;
}
