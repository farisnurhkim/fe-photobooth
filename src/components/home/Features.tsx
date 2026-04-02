"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Printer, ShieldCheck, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    title: 'Instant Print',
    description: 'Dye-sublimation technology ensuring your memories never fade. Ready in 15 seconds.',
    icon: <Printer size={24} className="text-yellow-600" />,
    className: 'md:col-span-2 bg-white',
  },
  {
    title: 'High-Res',
    description: 'Full-frame clarity with professional color grading applied instantly.',
    icon: <ShieldCheck size={24} className="text-white" />,
    className: 'md:col-span-1 bg-neutral-600 text-white',
  },
  {
    title: 'Premium Props',
    description: 'Curated collection of editorial accessories to enhance your signature look.',
    icon: <CheckSquare size={24} className="text-neutral-500" />,
    className: 'md:col-span-1 bg-white',
  },
  {
    title: 'Modern Technology',
    description: 'The latest mirrorless systems paired with classic studio lighting setups.',
    image: '/camera.png',
    className: 'md:col-span-2 relative overflow-hidden group',
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 max-w-7xl mx-auto scroll-mt-24">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-4xl font-bold tracking-tight text-neutral-800">Crafted for Quality</h2>
        <p className="text-neutral-500 font-medium">Every detail meticulously designed for the perfect shot.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col justify-end border border-neutral-100",
              f.className
            )}
          >
            {f.image ? (
              <>
                <img 
                  src={f.image} 
                  alt={f.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="relative z-10 space-y-2">
                  <h3 className="text-2xl font-bold text-white">{f.title}</h3>
                  <p className="text-sm text-neutral-300 max-w-sm">{f.description}</p>
                </div>
              </>
            ) : (
              <div className="space-y-6 h-full flex flex-col justify-between">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center p-3",
                  f.title === 'High-Res' ? 'bg-white/20' : 'bg-yellow-100/50'
                )}>
                  {f.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{f.title}</h3>
                  <p className="text-sm opacity-70 leading-relaxed font-medium">
                    {f.description}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
