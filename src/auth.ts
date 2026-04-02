import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import axiosInstance from './lib/axios';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials || {};
        
        try {
          const response = await axiosInstance.post('/auth/login', {
            email,
            password,
          });

          const data = response.data;

          if (data.success && data.token && data.user) {
            return {
              id: data.user.id,
              name: data.user.nama_lengkap,
              email: data.user.email,
              accessToken: data.token,
              role: data.user.role,
            };
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Incorrect email or password';
          // Throwing a specialized error might be better, but for now we try to pass the message
          throw new Error(errorMessage);
        }

        return null;
      },
    }),
  ],
});
