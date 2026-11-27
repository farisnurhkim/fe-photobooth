'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AnalyticsHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get('range') || '30';

  const ranges = [
    { label: 'Last 7 Days', value: '7' },
    { label: 'Last 30 Days', value: '30' },
    { label: 'Last 90 Days', value: '90' },
  ];

  const currentLabel = ranges.find(r => r.value === currentRange)?.label || 'Last 30 Days';

  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-7 gap-4">
      <div>
        <h1 className="text-2xl lg:text-[1.875rem] font-bold text-slate-900 leading-tight m-0 mb-1">
          Analytics Overview
        </h1>
        <p className="text-[0.9rem] text-slate-500 m-0">
          Performance & Studio Metrics
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-semibold text-slate-600 outline-none hover:bg-slate-50 cursor-pointer">
              <Calendar size={14} className="text-slate-400" />
              {currentLabel}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 ml-1"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl border-none shadow-xl min-w-[150px]">
            {ranges.map((r) => (
              <DropdownMenuItem
                key={r.value}
                onClick={() => router.push(`?range=${r.value}`)}
                className={`rounded-lg cursor-pointer py-2 ${currentRange === r.value ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 font-medium'}`}
              >
                {r.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
