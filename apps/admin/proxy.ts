import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Tạm thời vô hiệu hóa kiểm tra bảo mật để phát triển giao diện
 * Khi có API Auth, hãy mở lại logic kiểm tra Token ở đây.
 */
export async function proxy(_request: NextRequest) {
  // Cho phép tất cả các request đi qua
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Khớp tất cả các request trừ tài nguyên tĩnh
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
