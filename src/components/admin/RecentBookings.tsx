'use client';

import { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import type { BookingItem } from '@/lib/adminApi';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Props {
  initialData: BookingItem[];
  totalData: number;
  totalPages: number;
}

const STATUS_FILTERS = ['All', 'Confirmed', 'Pending'] as const;
type Filter = (typeof STATUS_FILTERS)[number];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  })
    .format(amount)
    .replace('IDR', 'Rp');
}

function formatDateTime(dateStr: string, slotStart?: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return slotStart ? `${date} • ${slotStart}` : date;
}

function getSlotTime(booking: BookingItem): string {
  const slots = booking.schedule_date_id?.slots || [];
  const slot = slots.find((s) => s._id === booking.schedule_slot_ids?.[0]);
  return slot ? `${slot.start_time}` : 'TBD';
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700 border-green-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    pending:   'bg-amber-100 text-amber-700 border-amber-200',
    cancelled: 'bg-red-100 text-red-600 border-red-200',
  };
  const cls = styles[status.toLowerCase()] ?? 'bg-amber-100 text-amber-700 border-amber-200';
  return (
    <Badge
      variant="outline"
      className={cn('text-[0.65rem] font-bold tracking-wide uppercase rounded-full px-2.5 py-0.5 border', cls)}
    >
      {status}
    </Badge>
  );
}

export default function RecentBookings({ initialData, totalData, totalPages }: Props) {
  const [filter, setFilter] = useState<Filter>('All');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<BookingItem[]>(initialData);
  const [total, setTotal] = useState(totalData);
  const [pages, setPages] = useState(totalPages);
  const [loading, setLoading] = useState(false);

  const filteredData =
    filter === 'All'
      ? data
      : data.filter((b) => b.status_booking.toLowerCase() === filter.toLowerCase());

  const fetchPage = async (newPage: number, newFilter: Filter) => {
    setLoading(true);
    try {
      const status = newFilter === 'All' ? '' : newFilter.toLowerCase();
      const params = new URLSearchParams({ page: String(newPage), limit: '5' });
      if (status) params.set('status', status);
      const res = await fetch(`/api/admin/bookings?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setTotal(json.totalData);
        setPages(json.totalPages);
      }
    } catch {
      // keep existing data
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (f: Filter) => {
    setFilter(f);
    setPage(1);
    fetchPage(1, f);
  };

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between pb-3 gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-bold text-foreground leading-tight">Recent Bookings</h2>
          <p className="text-[0.78rem] text-muted-foreground mt-0.5">Manage and track session statuses</p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-[0.78rem] font-medium cursor-pointer border-none transition-colors duration-150',
                filter === f
                  ? 'bg-amber-400 text-white font-semibold shadow-sm'
                  : 'bg-transparent text-muted-foreground hover:bg-background'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-b border-border hover:bg-muted/50">
                <TableHead className="text-[0.68rem] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap px-5">CLIENT</TableHead>
                <TableHead className="text-[0.68rem] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">PACKAGE</TableHead>
                <TableHead className="text-[0.68rem] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">DATE &amp; TIME</TableHead>
                <TableHead className="text-[0.68rem] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">AMOUNT</TableHead>
                <TableHead className="text-[0.68rem] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">STATUS</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((booking) => (
                  <TableRow key={booking._id} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                    <TableCell className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {booking.user_id?.nama_lengkap?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {booking.user_id?.nama_lengkap ?? 'Unknown'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span className="text-sm text-indigo-600 font-medium">
                        {booking.package_id?.nama_paket ?? '-'}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(
                        booking.schedule_date_id?.date ?? booking.createdAt,
                        getSlotTime(booking)
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 font-semibold text-sm text-foreground">
                      {booking.package_id?.harga != null
                        ? formatCurrency(booking.package_id.harga)
                        : '-'}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <StatusBadge status={booking.status_booking} />
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                        <MoreVertical size={15} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Showing {filteredData.length} of {total} bookings
          </span>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg text-base"
              onClick={() => {
                if (page <= 1) return;
                const p = page - 1;
                setPage(p);
                fetchPage(p, filter);
              }}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              ‹
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg text-base"
              onClick={() => {
                if (page >= pages) return;
                const p = page + 1;
                setPage(p);
                fetchPage(p, filter);
              }}
              disabled={page >= pages}
              aria-label="Next page"
            >
              ›
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
