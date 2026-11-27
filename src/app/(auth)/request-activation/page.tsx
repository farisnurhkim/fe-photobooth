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
import { Loader2, ArrowLeft, Key } from 'lucide-react';
import { useRouter } from 'next/navigation';

const schema = yup.object({
  email: yup.string().email('Format email tidak valid').required('Email wajib diisi')
});

export default function RequestActivationPage() {
  const { resendCode, isLoading } = useAuth();
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    const success = await resendCode(data.email);
    if (success) {
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-16 w-full py-10 relative">
      
      {/* Top Left Elements: Back Button */}
      <div className="absolute -top-16 left-0 scale-90 sm:scale-100 origin-top-left">
         <Link href="/login" className="group flex items-center gap-3 px-6 py-3 bg-white hover:bg-neutral-50 rounded-full border border-neutral-200 shadow-sm transition-all active:scale-95">
            <ArrowLeft size={16} className="text-neutral-500 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest">Back to Login</span>
         </Link>
      </div>

      {/* Main Form Card */}
      <Card className="border-0 shadow-2xl bg-white rounded-[40px] sm:w-[480px] w-full px-12 py-12 ring-1 ring-black/5 flex flex-col relative z-20">
        <CardHeader className="text-left pb-10 space-y-4">
          <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-600">
             <Key size={24} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-800">Activate.</h1>
          <p className="text-sm text-neutral-500 font-medium leading-relaxed max-w-[280px]">
            Enter your email to receive an activation code for your account.
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-neutral-500 tracking-[0.15em] uppercase ml-1">Email Address</Label>
              <Input 
                {...register('email')} 
                placeholder="curator@snapbook.com" 
                className="h-14 border-0 bg-neutral-100/60 focus-visible:ring-neutral-300 text-sm rounded-2xl px-5 font-medium"
              />
              {errors.email && <span className="text-xs text-red-500 font-bold ml-1">{errors.email.message}</span>}
            </div>

            <div className="pt-4">
               <Button 
                 type="submit" 
                 disabled={isLoading}
                 className="w-full h-15 bg-neutral-800 hover:bg-black text-white font-bold tracking-widest text-xs uppercase rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-70 py-7"
              >
                {isLoading ? (
                    <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> SENDING CODE...</>
                ) : 'SEND ACTIVATION CODE'}
              </Button>
            </div>

            <div className="pt-8 text-center text-[10px] text-neutral-400 tracking-[0.2em] font-black uppercase">
               Already active?{' '}
               <Link href="/login" className="text-neutral-900 border-b-2 border-yellow-600/30 hover:border-yellow-600 transition-all">
                 Login
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
         <div className="w-[380px] aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl skew-y-1 border-8 border-white ring-1 ring-black/5 -rotate-1">
             <img 
               src="/booth.png" 
               alt="Activation Focus" 
               className="w-full h-full object-cover scale-110 hover:scale-105 transition-all duration-700"
             />
         </div>
         {/* Decorative shadow glow */}
         <div className="absolute -bottom-10 -right-10 w-full h-full bg-neutral-900/5 blur-[80px] rounded-[48px] -z-10" />
      </motion.div>

    </div>
  );
}
