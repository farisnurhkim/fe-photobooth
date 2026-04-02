"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyClient() {
  const searchParams = useSearchParams();
  const codeParams = searchParams.get('code');
  const emailParams = searchParams.get('email');
  
  const { verifyEmail, resendCode, isLoading } = useAuth();
  const [pin, setPin] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [autoVerifyTried, setAutoVerifyTried] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    // Determine target email: query param takes priority, then fallback to localstorage
    const emailFromStorage = localStorage.getItem('pending_email');
    if (emailParams) {
      setTargetEmail(emailParams);
    } else if (emailFromStorage) {
      setTargetEmail(emailFromStorage);
    }
  }, [emailParams]);

  useEffect(() => {
    if (codeParams && targetEmail && !autoVerifyTried && !isLoading) {
      setPin(codeParams);
      setAutoVerifyTried(true);
      verifyEmail(targetEmail, codeParams);
    }
  }, [codeParams, targetEmail, autoVerifyTried, isLoading, verifyEmail]);

  // Timer Countdown Logic
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 6) {
       if (targetEmail) {
          verifyEmail(targetEmail, pin);
       } else {
          toast.error("Email verification target not found. Please register again.");
       }
    }
  };

  const handleResend = () => {
    if (targetEmail && resendTimer === 0) {
      resendCode(targetEmail);
      setResendTimer(60); // Start 60s cooldown
    }
  };

  return (
    <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-md rounded-[32px] sm:w-[500px] w-full mx-auto px-6 py-8 ring-1 ring-white/20">
      <CardHeader className="text-center pb-8 space-y-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-800 mt-2 italic underline decoration-yellow-600/20">SNAPBOOK</h1>
        <h2 className="text-2xl font-bold text-neutral-700">Activate Your Account</h2>
        <p className="text-xs font-medium text-neutral-500 max-w-[280px] mx-auto leading-relaxed">
          Please enter the 6-digit verification code sent to <br/> <span className="text-neutral-800 font-bold">{targetEmail || 'your email'}</span>
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col items-center space-y-10">
          
          <InputOTP 
            maxLength={6} 
            value={pin}
            onChange={(val) => setPin(val)}
            disabled={isLoading}
          >
            <InputOTPGroup className="gap-3 sm:gap-4">
              {[...Array(6)].map((_, i) => (
                <InputOTPSlot 
                  key={i}
                  index={i} 
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-neutral-100/80 border-0 rounded-xl font-bold text-2xl shadow-inner text-neutral-700 focus:ring-2 focus:ring-yellow-600/50 transition-all" 
                />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <Button 
             type="submit" 
             disabled={isLoading || pin.length !== 6}
             className="w-full max-w-[340px] h-15 bg-neutral-800 hover:bg-black text-white font-bold tracking-widest rounded-2xl transition-all shadow-xl text-xs uppercase py-7 disabled:opacity-50"
          >
             {isLoading ? <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> VERIFYING...</> : 'ACTIVATE COLLECTION'}
          </Button>

          <div className="pt-2 text-center text-[11px] text-neutral-400 font-bold uppercase tracking-widest">
             Didn't receive the code?{' '}
             {resendTimer > 0 ? (
                <span className="text-neutral-300">Resend in {resendTimer}s</span>
             ) : (
                <button 
                  onClick={handleResend}
                  type="button" 
                  disabled={isLoading}
                  className="text-yellow-700 font-black hover:underline transition-colors focus:outline-none disabled:opacity-50"
                >
                  Resend Code
                </button>
             )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
