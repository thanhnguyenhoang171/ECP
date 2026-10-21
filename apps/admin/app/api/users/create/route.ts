import { NextResponse } from 'next/server';

// Legacy adapter. The API verifies the token and authorizes role assignment.
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: Record<string, unknown> = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090/api';
    const response = await fetch(`${backendUrl.replace(/\/$/, '')}/v1/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: request.headers.get('authorization') || '' },
      body: JSON.stringify({ ...body, roles: body.roles ?? (typeof body.role === 'string' ? [body.role] : ['USER']) }),
      cache: 'no-store',
    });
    const result: unknown = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error: unknown) {
    console.error('User creation request failed:', error);
    return NextResponse.json({ success: false, message: 'Không thể kết nối dịch vụ tài khoản' }, { status: 502 });
  }
}
