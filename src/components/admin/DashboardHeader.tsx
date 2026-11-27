'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function DashboardHeader() {
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
        <h1 className="text-2xl lg:text-[1.875rem] font-bold text-foreground leading-tight m-0 mb-1">Overview</h1>
        <p className="text-sm text-muted-foreground m-0">
          Monitor your studio&apos;s performance and bookings.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger className={`${buttonVariants({ variant: "outline" })} h-9 rounded-xl gap-2 text-sm bg-white border-border justify-start font-medium`}>
              <Calendar size={14} />
              {currentLabel}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl border-none shadow-xl min-w-[150px]">
            {ranges.map((r) => (
              <DropdownMenuItem
                key={r.value}
                onClick={() => router.push(`?range=${r.value}`)}
                className={`rounded-lg cursor-pointer py-2 ${currentRange === r.value ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 font-medium'}`}
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
