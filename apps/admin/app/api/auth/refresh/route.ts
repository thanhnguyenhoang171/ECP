import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090/api';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ success: false, message: 'Refresh token missing' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
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

    const { accessToken, username, email, roles } = data.data;

    // We keep the same refresh token or backend might have returned a new one (not in current backend code)
    // If backend returns a new one, we should update the cookie here.

    return NextResponse.json({
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken,
        user: { username, email, roles }
      }
    });

  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
