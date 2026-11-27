"use client";

// import React from 'react';
import Link from 'next/link';
// import { Button } from '@/components/ui/button';
// import { Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full pt-16 pb-12 bg-neutral-50 px-6">
      <div className="max-w-7xl mx-auto space-y-20">

        {/* Newsletter Section */}
        {/* 
        <div className="bg-neutral-600 rounded-[40px] p-12 md:p-20 text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="space-y-6 max-w-lg relative z-10 text-center md:text-left">
            <h2 className="text-5xl font-bold tracking-tight">Let's Frame Your Story.</h2>
            <p className="text-neutral-300 font-medium leading-relaxed">
              Join our inner circle for exclusive session invites, editorial tips, and early access to seasonal studio themes.
            </p>
          </div>

          <div className="w-full max-w-md relative z-10">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-white transition-colors" size={20} />
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full h-14 bg-white/10 hover:bg-white/20 border-0 focus:ring-2 ring-white/30 rounded-full pl-14 pr-6 text-sm outline-none transition-all placeholder:text-neutral-400 font-medium"
                />
              </div>
              <Button className="h-14 px-10 bg-yellow-700 hover:bg-yellow-800 text-white font-bold rounded-full transition-all shadow-xl">
                Subscribe
              </Button>
            </div>
            <p className="text-[10px] text-neutral-400 mt-4 italic text-center md:text-left">
              Reserved for the discerning eye. No spam, ever.
            </p>
          </div>
        </div>
        */}

        {/* Global Footer Links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-neutral-200 text-neutral-500 font-medium text-sm">
          <Link href="/" className="text-xl font-bold tracking-tighter text-neutral-900">
            SnapBook
          </Link>

          <div className="flex flex-wrap justify-center items-center gap-10">
            <Link href="/privacy" className="hover:text-neutral-900 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-neutral-900 transition-colors">Terms</Link>
            <Link href="https://instagram.com" className="hover:text-neutral-900 transition-colors">Instagram</Link>
            <Link href="/contact" className="hover:text-neutral-900 transition-colors">Contact</Link>
          </div>

          <div className="text-xs text-neutral-400">
            © 2026 SnapBook Studio. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
