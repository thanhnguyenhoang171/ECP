import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090/api';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    // Optional: notify backend about logout to blacklist token
    if (authHeader) {
        await fetch(`${BACKEND_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader
            }
        });
    }

    const cookieStore = await cookies();
    cookieStore.delete('refreshToken');

    return NextResponse.json({
      success: true,
      message: 'Logged out'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
