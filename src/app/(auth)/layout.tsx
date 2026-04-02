"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import React from 'react';
import { cn } from '@/lib/utils';

const pageVariants = {
  initial: { opacity: 0, y: 15, scale: 0.98 },
  in: { opacity: 1, y: 0, scale: 1 },
  out: { opacity: 0, y: -15, scale: 1.02 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
} as const;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Globally clean background for all Auth pages per user request
  const bgImage = ""; 

  return (
    <div className={cn(
      "min-h-screen w-full relative overflow-hidden flex items-center justify-center bg-[#f8f9fa]"
    )}>
      {/* Subtle vector pattern for clean background as seen in design */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
         <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
               <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="black" strokeWidth="1"/>
               </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
         </svg>
      </div>

      <div className="z-10 w-full flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            // Broad layout for side-by-side components
            className="w-full max-w-4xl transition-all duration-500"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
