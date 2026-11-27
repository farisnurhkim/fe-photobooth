'use client';

import { TrendingUp, TrendingDown, Banknote, Smartphone, Receipt, RefreshCw } from 'lucide-react';
import { FullAnalyticsData } from '@/lib/adminApi';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount).replace('IDR', 'Rp');
}

function StatCard({ 
  title, 
  value, 
  growth, 
  icon: Icon, 
  isCurrency = false,
  isPercentage = false
}: { 
  title: string; 
  value: number; 
  growth: number; 
  icon: any;
  isCurrency?: boolean;
  isPercentage?: boolean;
}) {
  const isPositive = growth >= 0;
  
  let displayValue = value.toLocaleString();
  if (isCurrency) displayValue = formatCurrency(value);
  if (isPercentage) displayValue = `${value}%`;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] flex flex-col gap-4 border border-slate-100">
      <div className="flex justify-between items-start">
        <span className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
          <Icon size={16} />
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <span className="text-2xl font-bold text-slate-900">{displayValue}</span>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="flex items-center gap-0.5">
            {isPositive ? (
              <TrendingUp size={14} className="text-emerald-500" />
            ) : (
              <TrendingDown size={14} className="text-rose-500" />
            )}
            <span className={`text-xs font-semibold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isPositive ? '+' : ''}{growth}%
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium">vs last month</span>
        </div>
      </div>
    </div>
  );
}

export default function StatCardsRow({ data }: { data: FullAnalyticsData }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Revenue"
        value={data.totalRevenue}
        growth={data.revenueGrowth}
        icon={Banknote}
        isCurrency
      />
      <StatCard
        title="Total Bookings"
        value={data.totalBookings}
        growth={data.bookingsGrowth}
        icon={Smartphone}
      />
      <StatCard
        title="Avg Booking Value"
        value={data.avgBookingValue}
        growth={data.avgBookingValueGrowth}
        icon={Receipt}
        isCurrency
      />
      <StatCard
        title="Conversion Rate"
        value={data.conversionRate}
        growth={data.conversionRateGrowth}
        icon={RefreshCw}
        isPercentage
      />
    </div>
  );
}
