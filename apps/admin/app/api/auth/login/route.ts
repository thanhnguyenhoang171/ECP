import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090/api';

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

    const { accessToken, refreshToken, username, email, roles } = data.data;

    // Set HttpOnly cookie for Refresh Token
    const cookieStore = await cookies();
    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/', // accessible to all routes
      maxAge: 7 * 24 * 60 * 60, // 7 days (adjust based on backend refresh expiration)
    });

    // Return Access Token and User info (No refresh token in body)
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: { username, email, roles }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
