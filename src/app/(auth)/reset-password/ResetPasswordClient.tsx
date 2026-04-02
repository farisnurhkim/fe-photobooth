"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const schema = yup.object({
  newPassword: yup.string().min(8, 'Minimal 8 karakter').required('Password baru wajib diisi'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Password tidak cocok')
    .required('Konfirmasi password wajib diisi'),
});

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const { resetPassword, isLoading } = useAuth();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: any) => {
    if (!token) {
        alert("Token tidak ditemukan di URL. Silakan cek kembali email Anda.");
        return;
    }
    resetPassword({ token, newPassword: data.newPassword });
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-16 w-full py-10 relative">
      
      {/* Top Left Elements: Back Button & Logo Concept */}
      <div className="absolute -top-16 left-0 flex flex-col gap-2 scale-90 sm:scale-100 origin-top-left">
         
         <Link href="/" className="group flex items-center gap-3 px-6 py-3 bg-white hover:bg-neutral-50 rounded-full border border-neutral-200 shadow-sm transition-all active:scale-95">
            <ArrowLeft size={16} className="text-neutral-500 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest">Back to Home</span>
         </Link>
      </div>

      {/* Main Form Card */}
      <Card className="border-0 shadow-2xl bg-white rounded-[48px] sm:w-[500px] w-full px-12 py-8 ring-1 ring-black/5 flex flex-col relative z-20">
        <CardHeader className="text-left pb-10 space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-800">Reset Password</h1>
          <p className="text-sm text-neutral-500 font-medium leading-relaxed max-w-[280px]">
            Enter your new password to regain access to your studio.
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            
            {/* New Password Field */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-neutral-500 tracking-[0.2em] uppercase">New Password</Label>
              <div className="relative z-10">
                <Input 
                  type={showNew ? 'text' : 'password'}
                  {...register('newPassword')} 
                  placeholder="••••••••" 
                  className="h-15 border-0 bg-neutral-100/60 focus-visible:ring-neutral-300 text-sm rounded-2xl pr-14 font-medium tracking-[0.2em]"
                />
                <button 
                  type="button"
                  onClick={(e) => {
                      e.preventDefault();
                      setShowNew(!showNew);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 text-neutral-400 hover:text-neutral-700 transition-colors bg-neutral-100/0 rounded-lg hover:bg-neutral-200/50"
                  style={{ pointerEvents: 'auto' }}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && <span className="text-xs text-red-500 font-bold block ml-1">{errors.newPassword.message}</span>}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-neutral-500 tracking-[0.2em] uppercase">Confirm Password</Label>
              <div className="relative z-10">
                <Input 
                  type={showConfirm ? 'text' : 'password'}
                  {...register('confirmPassword')} 
                  placeholder="••••••••" 
                  className="h-15 border-0 bg-neutral-100/60 focus-visible:ring-neutral-300 text-sm rounded-2xl pr-14 font-medium tracking-[0.2em]"
                />
                <button 
                  type="button"
                  onClick={(e) => {
                      e.preventDefault();
                      setShowConfirm(!showConfirm);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 text-neutral-400 hover:text-neutral-700 transition-colors bg-neutral-100/0 rounded-lg hover:bg-neutral-200/50"
                  style={{ pointerEvents: 'auto' }}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="text-xs text-red-500 font-bold block ml-1">{errors.confirmPassword.message}</span>}
            </div>

            <div className="pt-6">
               <Button 
                 type="submit" 
                 disabled={isLoading || !token}
                 className="w-full h-15 bg-neutral-600 hover:bg-neutral-700 text-white font-bold tracking-tight text-base rounded-[24px] transition-all shadow-xl active:scale-95 disabled:opacity-50 border-2 border-dashed border-blue-400/30"
              >
                {isLoading ? (
                    <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Processing...</>
                ) : 'Reset Password'}
              </Button>
            </div>

            <div className="pt-2 text-center">
               <p className="text-[11px] text-neutral-500 font-bold tracking-wide">
                  Need help? <Link href="/contact" className="text-yellow-700 hover:underline">Contact Support</Link>
               </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Floating Side Image Element from Design */}
      <motion.div 
         initial={{ opacity: 0, x: 50 }}
         whileInView={{ opacity: 1, x: 0 }}
         transition={{ duration: 1 }}
         className="relative hidden lg:block"
      >
         <div className="w-[380px] aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl skew-y-1 border-8 border-white ring-1 ring-black/5 rotate-2">
             <img 
               src="/chair_bg.png" 
               alt="Design Element" 
               className="w-full h-full object-cover scale-110"
             />
         </div>
         {/* Subtle shadow glow */}
         <div className="absolute -bottom-10 -right-10 w-full h-full bg-black/10 blur-[60px] rounded-[48px] -z-10" />
      </motion.div>

    </div>
  );
}
