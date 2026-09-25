import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get('ecp_refresh_token');
  const { pathname } = request.nextUrl;

  // List of protected routes
  const protectedRoutes = [
    '/dashboard',
    '/products',
    '/categories',
    '/orders',
    '/users',
    '/warehouses',
    '/stock',
    '/inventory-ledger',
    '/profile',
    '/customers',
    '/payments',
  ];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Protected routes check
  if (isProtectedRoute) {
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
    '/warehouses/:path*',
    '/stock/:path*',
    '/inventory-ledger/:path*',
    '/profile/:path*',
    '/customers/:path*',
    '/payments/:path*',
    '/login',
    '/register',
  ],
};

