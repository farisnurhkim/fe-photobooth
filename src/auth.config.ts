import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
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
                             nextUrl.pathname.startsWith('/my-bookings') ||
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
      if (trigger === "update" && session?.user) {
        if (session.user.name) token.name = session.user.name;
        if (session.user.email) token.email = session.user.email;
      }
      
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
