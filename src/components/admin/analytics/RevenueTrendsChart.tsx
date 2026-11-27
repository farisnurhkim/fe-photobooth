'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function RevenueTrendsChart({ data }: { data: { date: string; value: number }[] }) {
  const searchParams = useSearchParams();
  const currentRange = searchParams.get('range') || '30';
  const router = useRouter();

  const formatYAxis = (tickItem: number) => {
    if (tickItem === 0) return 'Rp0';
    if (tickItem >= 1000000) return `Rp${tickItem / 1000000}M`;
    if (tickItem >= 1000) return `Rp${tickItem / 1000}K`;
    return `Rp${tickItem}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col items-center">
          <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</span>
          <span className="text-lg font-bold text-slate-800">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(payload[0].value).replace('IDR', 'Rp')}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col col-span-1 lg:col-span-2">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-0.5">Revenue Trends</h3>
          <p className="text-[0.8rem] text-slate-500 m-0">Daily revenue growth over selected period</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="text-slate-400 hover:bg-slate-50 p-1.5 rounded-lg cursor-pointer border-none bg-transparent outline-none">
            <MoreVertical size={18} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl border-none shadow-xl min-w-[150px]">
            <DropdownMenuItem onClick={() => router.push('?range=30')} className={`rounded-lg cursor-pointer py-2 ${currentRange === '30' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 font-medium'}`}>
              Sebulan Terakhir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('?range=365')} className={`rounded-lg cursor-pointer py-2 ${currentRange === '365' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 font-medium'}`}>
              Setahun Terakhir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('?range=1825')} className={`rounded-lg cursor-pointer py-2 ${currentRange === '1825' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 font-medium'}`}>
              5 Tahun Terakhir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('?range=9999')} className={`rounded-lg cursor-pointer py-2 ${currentRange === '9999' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 font-medium'}`}>
              All Time
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9a8c66" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9a8c66" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#94a3b8' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={formatYAxis}
              width={65}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#83734a" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              activeDot={{ r: 6, fill: '#83734a', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
