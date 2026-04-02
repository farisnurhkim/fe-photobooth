import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token header
axiosInstance.interceptors.request.use(
  async (config) => {
    let token = null;

    if (typeof window !== 'undefined') {
      // Client-side: getSession works
      const session = await getSession();
      token = (session?.user as any)?.accessToken;
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        // Sign out on 401
        await signOut({ redirect: true, callbackUrl: '/login' });
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
