import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isSecureRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  if (isSecureRoute) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'cjp-satirical-jwt-secret-key-2026');
      const { payload } = await jwtVerify(token, secret);

      // Check admin protection
      if (pathname.startsWith('/admin')) {
        const adminEmails = ['admin@cjp.org', 'admin@cockroachindia.shop', 'admin@cockroach.store', 'admin@cockroachindia.store'];
        if (!payload.isAdmin && !adminEmails.includes(payload.email)) {
          return NextResponse.redirect(new URL('/', request.url));
        }
      }
    } catch (err) {
      console.error('Middleware JWT verification failed:', err.message);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  if (isAuthRoute && token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'cjp-satirical-jwt-secret-key-2026');
      await jwtVerify(token, secret);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (err) {
      // Invalid token, let them log in
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
};
