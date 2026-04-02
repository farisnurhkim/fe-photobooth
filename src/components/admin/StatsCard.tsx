import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  growth: number;
  icon: LucideIcon;
  dark?: boolean;
}

export default function StatsCard({ title, value, growth, icon: Icon, dark = false }: StatsCardProps) {
  const isPositive = growth >= 0;

  return (
    <Card
      className={cn(
        'rounded-2xl shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 border-0',
        dark ? 'bg-linear-to-br from-[#2d3250] to-[#1a1d2e] text-white' : 'bg-white'
      )}
    >
      <CardContent className="p-5 flex flex-col gap-4">
        {/* Icon + Growth */}
        <div className="flex items-center justify-between">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              dark ? 'bg-white/10 text-white' : 'bg-indigo-50 text-indigo-600'
            )}
          >
            <Icon size={21} />
          </div>

          <Badge
            variant="secondary"
            className={cn(
              'flex items-center gap-1 text-[0.72rem] font-semibold rounded-full px-2.5 py-0.5 border-0',
              isPositive
                ? dark
                  ? 'bg-green-900/40 text-green-400'
                  : 'bg-green-100 text-green-700'
                : dark
                ? 'bg-red-900/40 text-red-400'
                : 'bg-red-100 text-red-600'
            )}
          >
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositive ? '+' : ''}{growth.toFixed(1)}%
          </Badge>
        </div>

        {/* Label + Value */}
        <div className="flex flex-col gap-0.5">
          <p className={cn('text-[0.8rem] m-0', dark ? 'text-white/60' : 'text-muted-foreground')}>
            {title}
          </p>
          <h3
            className={cn(
              'text-2xl font-bold m-0 leading-tight',
              dark ? 'text-white' : 'text-foreground'
            )}
          >
            {value}
          </h3>
        </div>

        {/* Decorative bar */}
        <div className={cn('h-1 rounded-full overflow-hidden', dark ? 'bg-white/10' : 'bg-muted')}>
          <div
            className={cn(
              'h-full w-[70%] rounded-full',
              dark
                ? 'bg-linear-to-r from-blue-400 to-indigo-400'
                : 'bg-linear-to-r from-yellow-500 to-amber-400'
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
