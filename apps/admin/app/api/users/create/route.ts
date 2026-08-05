import { NextResponse } from 'next/server';

const getAdminBackendUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL;
  return (envUrl && envUrl.startsWith('http')) ? envUrl : 'http://localhost:9090/api';
};
const BACKEND_URL = getAdminBackendUrl();

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const body = await request.json();

    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      role,
      active,
      avatarUrl,
      avatarPublicId,
      password,
    } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email là bắt buộc' },
        { status: 400 }
      );
    }

    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Vai trò (role) là bắt buộc' },
        { status: 400 }
      );
    }

    // Determine operator role from token or request headers
    let operatorRole = 'MANAGER'; // Default fallback scope
    let operatorEmail = 'System';

    if (authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
          const decodedJson = JSON.parse(
            Buffer.from(payloadBase64, 'base64').toString('utf-8')
          );
          if (decodedJson.roles && Array.isArray(decodedJson.roles)) {
            operatorRole = decodedJson.roles[0] || 'MANAGER';
          } else if (decodedJson.role) {
            operatorRole = decodedJson.role;
          }
          if (decodedJson.sub || decodedJson.email) {
            operatorEmail = decodedJson.sub || decodedJson.email;
          }
        }
      } catch (e) {
        console.warn('Failed to parse bearer token in route handler:', e);
      }
    }

    const isSuperAdmin =
      operatorRole === 'SUPER_ADMIN' || operatorRole === 'ROLE_SUPER_ADMIN';
    const isManager =
      operatorRole === 'MANAGER' || operatorRole === 'ROLE_MANAGER';

    // 🔒 ROLE AUTHORIZATION CHECK:
    // Manager is restricted to creating only MANAGER or USER roles.
    if (isManager && role === 'SUPER_ADMIN') {
      console.warn(
        `Manager ${operatorEmail} attempted to create SUPER_ADMIN user (${email}). Access denied.`
      );
      return NextResponse.json(
        {
          success: false,
          message:
            'Tài khoản cấp Quản lý (Manager) không có quyền tạo tài khoản Quản trị viên cao cấp (Super Admin).',
        },
        { status: 403 }
      );
    }

    const scope = isSuperAdmin ? 'admin' : 'manager';

    const payload = {
      email,
      firstName: firstName || '',
      lastName: lastName || '',
      phoneNumber: phoneNumber || '',
      role,
      active: active !== undefined ? active : true,
      avatarUrl: avatarUrl || '',
      avatarPublicId: avatarPublicId || '',
      password: password || '',
    };

    // Forward create request to Backend microservice
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const backendRes = await fetch(`${BACKEND_URL}/v1/${scope}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const responseData = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message: responseData.message || 'Không thể tạo người dùng trên hệ thống backend',
        },
        { status: backendRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: responseData.message || 'Tạo tài khoản người dùng mới thành công',
      data: responseData.data || responseData,
    });
  } catch (error: any) {
    console.error('API create user error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Lỗi xử lý hệ thống khi tạo người dùng',
      },
      { status: 500 }
    );
  }
}
