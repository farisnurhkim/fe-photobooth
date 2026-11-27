"use client";

import axiosInstance from '@/lib/axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const schema = yup.object({
  email: yup.string().email('Format email tidak valid').required('Email wajib diisi'),
  password: yup.string().required('Password wajib diisi'),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // 1. Lakukan pre-flight check langsung ke backend untuk mendapatkan pesan error asli
      let actualError = null;
      try {
        await axiosInstance.post('/auth/login', {
          email: data.email,
          password: data.password,
        });
      } catch (err: any) {
        actualError = err.response?.data?.message || 'Email atau password salah';
      }

      if (actualError) {
        toast.error(actualError);
        setIsLoading(false);
        return;
      }

      // 2. Jika sukses, baru buat session di frontend
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Gagal membuat sesi, silakan coba lagi.');
      } else {
        toast.success('Login successful');
        window.location.href = '/';
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-16 w-full py-10 relative">

      {/* Top Left Elements: Back Button */}
      <div className="absolute -top-16 left-0 scale-90 sm:scale-100 origin-top-left">
        <Link href="/" className="group flex items-center gap-3 px-6 py-3 bg-white hover:bg-neutral-50 rounded-full border border-neutral-200 shadow-sm transition-all active:scale-95">
          <ArrowLeft size={16} className="text-neutral-500 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest">Back to Home</span>
        </Link>
      </div>

      {/* Main Form Card */}
      <Card className="border-0 shadow-2xl bg-white rounded-[40px] sm:w-[480px] w-full px-10 py-12 ring-1 ring-black/5 flex flex-col relative z-20">
        <CardHeader className="text-center pb-8 space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 mt-2 italic underline decoration-yellow-600/30 underline-offset-8">SNAPBOOK</h1>
          <div className="flex items-center justify-center gap-3">
            <span className="w-8 h-[0.5px] bg-neutral-200"></span>
            <p className="text-[9px] font-black tracking-[0.2em] text-neutral-400 uppercase">Studio Entry</p>
            <span className="w-8 h-[0.5px] bg-neutral-200"></span>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2.5">
              <Label className="text-[10px] font-black text-neutral-500 tracking-[0.15em] uppercase ml-1">Account Email</Label>
              <Input
                {...register('email')}
                placeholder="studio@snapbook.com"
                className="h-14 border-0 bg-neutral-100/60 focus-visible:ring-neutral-300 text-sm rounded-2xl px-5 font-medium"
              />
              {errors.email && <span className="text-xs text-red-500 font-bold ml-1">{errors.email.message}</span>}
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center px-1">
                <Label className="text-[10px] font-black text-neutral-500 tracking-[0.15em] uppercase">Password</Label>
                <Link href="/forgot-password" title="RECOVERY" className="text-[9px] font-bold text-yellow-700 tracking-wider uppercase hover:underline transition-all">
                  Forgot Password?
                </Link>
              </div>
              <Input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="h-14 border-0 bg-neutral-100/60 focus-visible:ring-neutral-300 text-sm rounded-2xl px-5 tracking-[0.3em] font-medium"
              />
              {errors.password && <span className="text-xs text-red-500 font-bold ml-1">{errors.password.message}</span>}
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-15 bg-neutral-800 hover:bg-black text-white font-bold tracking-widest text-xs uppercase rounded-2xl transition-all shadow-xl disabled:opacity-70 active:scale-95 py-7"
              >
                {isLoading ? (
                  <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> VERIFYING ACCESS...</>
                ) : 'ENTER STUDIO'}
              </Button>
            </div>

            <div className="pt-8 text-center text-[11px] text-neutral-400 tracking-wide font-bold uppercase space-y-3">
               <div>
                 Don't have an account?{' '}
                 <Link href="/register" className="text-neutral-900 border-b-2 border-yellow-600/30 hover:border-yellow-600 transition-all">
                   Join The Collection
                 </Link>
               </div>
               <div>
                 Account not activated?{' '}
                 <Link href="/request-activation" className="text-neutral-900 border-b-2 border-yellow-600/30 hover:border-yellow-600 transition-all">
                   Activate Here
                 </Link>
               </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Side Illustration Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative hidden lg:block"
      >
        <div className="w-[380px] aspect-[4/5] rounded-[48px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-8 border-white ring-1 ring-black/5">
          <img
            src="/booth.png"
            alt="Studio Atmosphere"
            className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700 hover:scale-105"
          />
        </div>
        {/* Decorative shadow glow */}
        <div className="absolute -bottom-10 -right-10 w-full h-full bg-yellow-600/5 blur-[80px] rounded-[48px] -z-10" />
      </motion.div>

    </div>
  );
}
