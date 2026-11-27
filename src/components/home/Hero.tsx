"use client";

import Image from 'next/image';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Star } from 'lucide-react';

export default function Hero() {
  const { data: session, status } = useSession();
  const isLogged = status === 'authenticated';

  const handleScrollToFeatures = () => {
    const section = document.getElementById('features');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 min-h-[90vh]">
      {/* Left Text Content */}
      <div className="flex-1 space-y-8 text-center md:text-left">
        <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="inline-block bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase"
        >
          Premium Studio Experience
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-800 leading-[1.1]"
        >
          Capture Your <br />
          <span className="text-yellow-600 italic">Signature</span> Frame.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-neutral-500 max-w-md mx-auto md:mx-0 font-medium leading-relaxed"
        >
          An editorial approach to personal photography. Minimalist aesthetics, professional lighting, and instant high-end prints.
        </motion.p>

        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4"
        >
          <Link href={isLogged ? "/packages" : "/login"}>
             <Button className="h-14 px-10 rounded-full font-bold text-sm bg-neutral-800 hover:bg-neutral-900 shadow-xl transition-all hover:scale-105">
                Book Now
             </Button>
          </Link>
          <Button 
            onClick={handleScrollToFeatures}
            variant="ghost" 
            className="h-14 px-8 rounded-full font-bold text-sm bg-neutral-100/50 hover:bg-white text-neutral-600 transition-all"
          >
             View Gallery
          </Button>
        </motion.div>
      </div>

      {/* Right Image Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="flex-1 relative w-full"
      >
        <div className="relative rounded-[40px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)] border-8 border-white group">
          <Image 
            src="/booth.png" 
            alt="Photography Studio" 
            width={800}
            height={1000}
            priority
            className="w-full h-full aspect-4/5 object-cover"
          />
          
          {/* Quote Overlay Card */}
          <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.8 }}
             className="absolute bottom-10 -left-6 md:-left-12 bg-white p-6 rounded-[24px] shadow-2xl max-w-[200px] border border-neutral-100 hidden sm:block"
          >
             <p className="text-xs font-serif italic text-neutral-600 leading-relaxed mb-3">
               "The light is everything."
             </p>
             <div className="flex gap-1">
               {[1,2,3,4,5].map(s => <Star key={s} size={10} fill="#ca8a04" stroke="none" />)}
             </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
