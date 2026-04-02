import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const { auth } = NextAuth(authConfig);

export const proxy = async (request: NextRequest) => {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    // Not logged in → redirect to login
    if (!session?.user) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Logged in but not admin → redirect to home
    const role = (session.user as any)?.role;
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Delegate everything else to the default NextAuth proxy
  return (auth as any)(request);
};

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};

