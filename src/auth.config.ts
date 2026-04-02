import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith('/login') || 
                        nextUrl.pathname.startsWith('/register') || 
                        nextUrl.pathname.startsWith('/forgot-password') || 
                        nextUrl.pathname.startsWith('/reset-password');
      const isProtectedPage = nextUrl.pathname.startsWith('/dashboard') || 
                             nextUrl.pathname.startsWith('/bookings/my-bookings') ||
                             nextUrl.pathname.startsWith('/admin');

      if (isProtectedPage) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      } else if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as any).id;
        token.accessToken = (user as any).accessToken;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  providers: [], // Add providers in auth.ts as some are not edge-compatible
} satisfies NextAuthConfig;
