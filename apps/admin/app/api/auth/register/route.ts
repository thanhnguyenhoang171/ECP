import { NextResponse } from 'next/server';

const getAdminBackendUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL;
  return (envUrl && envUrl.startsWith('http')) ? envUrl : 'http://localhost:9090/api';
};
const BACKEND_URL = getAdminBackendUrl();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log(`Registering user: ${body.username}`);
    
    const response = await fetch(`${BACKEND_URL}/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn(`Registration failed for ${body.username}:`, data.message);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      message: 'Đăng ký thành công',
      data: data.data
    });

  } catch (error) {
    console.error('Register route error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống, vui lòng thử lại sau' }, { status: 500 });
  }
}
