import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const getAdminBackendUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL;
  return (envUrl && envUrl.startsWith('http')) ? envUrl : 'http://localhost:9090/api';
};
const BACKEND_URL = getAdminBackendUrl();

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    // Optional: notify backend about logout to blacklist token
    if (authHeader || refreshToken) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (authHeader) headers['Authorization'] = authHeader;

        await fetch(`${BACKEND_URL}/auth/logout`, {
            method: 'POST',
            headers,
            body: refreshToken ? JSON.stringify({ refreshToken }) : undefined
        });
    }

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
