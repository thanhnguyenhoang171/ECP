import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken');
  const { pathname } = request.nextUrl;

  // Protected routes
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/products') || 
      pathname.startsWith('/categories') ||
      pathname.startsWith('/orders') ||
      pathname.startsWith('/users')) {
    
    if (!refreshToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Auth routes (redirect to dashboard if already logged in)
  if (pathname === '/login' || pathname === '/register') {
    if (refreshToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/products/:path*',
    '/categories/:path*',
    '/orders/:path*',
    '/users/:path*',
    '/login',
    '/register',
  ],
};
