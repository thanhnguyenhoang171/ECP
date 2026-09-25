import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const getAdminBackendUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL;
  return (envUrl && envUrl.startsWith('http')) ? envUrl : 'http://localhost:9090/api';
};
const BACKEND_URL = getAdminBackendUrl();

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('Authorization');
    
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('ecp_refresh_token')?.value;

    // Always delete auth cookie immediately to guarantee session termination
    cookieStore.delete('ecp_refresh_token');

    // Notify backend about logout with short timeout to prevent blocking client
    if (authHeader || refreshToken) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (authHeader) {
          headers['Authorization'] = authHeader;
        }

        await fetch(`${BACKEND_URL}/v1/auth/logout`, {
          method: 'POST',
          headers,
          body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
          signal: AbortSignal.timeout(2000),
        });
      } catch (backendError) {
        console.warn('[Logout Route] Backend logout notification timed out or failed:', backendError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out',
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

