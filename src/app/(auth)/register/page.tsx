"use client";

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

const schema = yup.object({
  nama_lengkap: yup.string().required('Nama Lengkap wajib diisi'),
  email: yup.string().email('Format email tidak valid').required('Email wajib diisi'),
  password: yup.string().min(8, 'Minimal 8 karakter').required('Password wajib diisi'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Password tidak sama')
    .required('Konfirmasi password wajib diisi'),
});

export default function RegisterPage() {
  const { register: registerAction, isLoading } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: any) => {
    const { confirmPassword, ...registerData } = data;
    registerAction(registerData);
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
      <Card className="border-0 shadow-2xl bg-white rounded-[40px] sm:w-[500px] w-full px-10 py-12 ring-1 ring-black/5 flex flex-col relative z-20">
        <CardHeader className="text-left pb-8 space-y-4">
          <p className="text-[10px] font-black tracking-[0.2em] text-yellow-700 uppercase ml-1">Registration</p>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-800 leading-tight">Create your <br/>creative space.</h1>
          <p className="text-sm text-neutral-500 font-medium leading-relaxed max-w-[320px]">
            Join our community of elite photographers and curate your digital presence.
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2.5">
              <Label className="text-[10px] font-black text-neutral-500 tracking-[0.15em] uppercase ml-1">Full Name</Label>
              <Input 
                {...register('nama_lengkap')} 
                placeholder="Johnathan Doe" 
                className="h-14 border-0 bg-neutral-100/60 focus-visible:ring-neutral-300 text-sm rounded-2xl px-5 font-medium"
              />
              {errors.nama_lengkap && <span className="text-xs text-red-500 font-bold ml-1">{errors.nama_lengkap.message}</span>}
            </div>

            <div className="space-y-2.5">
              <Label className="text-[10px] font-black text-neutral-500 tracking-[0.15em] uppercase ml-1">Email Address</Label>
              <Input 
                {...register('email')} 
                placeholder="curator@snapbook.com" 
                className="h-14 border-0 bg-neutral-100/60 focus-visible:ring-neutral-300 text-sm rounded-2xl px-5 font-medium"
              />
              {errors.email && <span className="text-xs text-red-500 font-bold ml-1">{errors.email.message}</span>}
            </div>

            <div className="space-y-2.5">
              <Label className="text-[10px] font-black text-neutral-500 tracking-[0.15em] uppercase ml-1">Password</Label>
              <Input 
                type="password"
                {...register('password')} 
                placeholder="••••••••" 
                className="h-14 border-0 bg-neutral-100/60 focus-visible:ring-neutral-300 text-sm rounded-2xl px-5 tracking-[0.3em] font-medium"
              />
              <div className="flex items-center gap-2 mt-1 ml-1 text-neutral-400">
                 <CheckCircle2 size={12} className="text-green-600/50" />
                 <span className="text-[10px] font-bold">At least 8 characters</span>
              </div>
              {errors.password && <span className="text-xs text-red-500 font-bold ml-1">{errors.password.message}</span>}
            </div>

            <div className="space-y-2.5">
              <Label className="text-[10px] font-black text-neutral-500 tracking-[0.15em] uppercase ml-1">Confirm Password</Label>
              <Input 
                type="password"
                {...register('confirmPassword')} 
                placeholder="••••••••" 
                className="h-14 border-0 bg-neutral-100/60 focus-visible:ring-neutral-300 text-sm rounded-2xl px-5 tracking-[0.3em] font-medium"
              />
              {errors.confirmPassword && <span className="text-xs text-red-500 font-bold ml-1">{errors.confirmPassword.message as string}</span>}
            </div>

            <div className="pt-4">
               <Button 
                 type="submit" 
                 disabled={isLoading}
                 className="w-full h-15 bg-neutral-800 hover:bg-black text-white font-bold tracking-widest text-xs uppercase rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-70 py-7"
              >
                {isLoading ? (
                    <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> CREATING ACCOUNT...</>
                ) : (
                    'GET STARTED NOW'
                )}
              </Button>
            </div>

            <div className="pt-8 text-center text-[11px] text-neutral-400 tracking-wide font-bold uppercase">
               Already have an account?{' '}
               <Link href="/login" className="text-neutral-900 border-b-2 border-yellow-600/30 hover:border-yellow-600 transition-all">
                 Back to Log in
               </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Side Illustration Image */}
      <motion.div 
         initial={{ opacity: 0, scale: 0.9, x: 30 }}
         animate={{ opacity: 1, scale: 1, x: 0 }}
         transition={{ duration: 1, ease: 'easeOut' }}
         className="relative hidden lg:block"
      >
         <div className="w-[380px] aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl skew-y-1 border-8 border-white ring-1 ring-black/5 rotate-2">
             <img 
               src="/chair_bg.png" 
               alt="Modern Aesthetic" 
               className="w-full h-full object-cover scale-110 hover:scale-105 transition-all duration-700"
             />
         </div>
         {/* Decorative shadow glow */}
         <div className="absolute -bottom-10 -right-10 w-full h-full bg-neutral-900/5 blur-[80px] rounded-[48px] -z-10" />
      </motion.div>

    </div>
  );
}
