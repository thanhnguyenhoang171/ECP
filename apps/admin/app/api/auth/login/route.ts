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

    const { id, accessToken, refreshToken, username, email, roles } = data.data;
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

    // Return Access Token and User info (Including refreshToken as requested)
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        id,
        accessToken,
        username,
        email,
        roles
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
