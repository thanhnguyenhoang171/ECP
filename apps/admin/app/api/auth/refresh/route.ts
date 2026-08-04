import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const getAdminBackendUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL;
  return (envUrl && envUrl.startsWith('http')) ? envUrl : 'http://localhost:9090/api';
};
const BACKEND_URL = getAdminBackendUrl();

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ success: false, message: 'Refresh token missing' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      // If refresh fails, clear the cookie
      cookieStore.delete('refreshToken');
      return NextResponse.json(data, { status: response.status });
    }

    const { accessToken } = data.data;

    return NextResponse.json({
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken,
      }
    });

  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
