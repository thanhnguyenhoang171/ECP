import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const getAdminBackendUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL;
  return (envUrl && envUrl.startsWith('http')) ? envUrl : 'http://localhost:9090/api';
};
const BACKEND_URL = getAdminBackendUrl();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const { accessToken, refreshToken } = data.data;
    const { remember } = body;

    // Set HttpOnly cookie for Refresh Token
    const cookieStore = await cookies();

    // Cookie options
    const cookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/', // accessible to all routes
    };

    // If "Remember Me" is checked, set expiration (7 days)
    // If not, it becomes a Session Cookie (expires when browser closes)
    if (remember) {
      cookieOptions.maxAge = 7 * 24 * 60 * 60; // 7 days
    }

    cookieStore.set('refreshToken', refreshToken, cookieOptions);

    // Return Access Token only — user profile will be fetched via /v1/users/account
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
