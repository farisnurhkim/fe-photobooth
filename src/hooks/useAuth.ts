import { useState } from 'react';
import axiosInstance from '../lib/axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/auth/register', data);
      localStorage.setItem('pending_email', data.email);
      toast.success(res.data.message || 'Registration successful. Cek Email untuk Kode Verifikasi.');
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/auth/verify-email', { email, activationCode: code });
      toast.success(res.data.message || 'Email verified successfully! You can now login.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed. Code might be invalid or expired.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/auth/verify-email', { email });
      toast.success(res.data.message || 'Verification code resent successfully.');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend code.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/auth/forgot-password', data);
      toast.success(res.data.message || 'Reset link has been sent to your Zoho mail!');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Request failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/auth/reset-password', data);
      toast.success(res.data.message || 'Password reset successful! Please login.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid or expired token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return { register, verifyEmail, resendCode, forgotPassword, resetPassword, isLoading };
};
