import type { BookingItem } from '@/lib/adminApi';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Props {
  bookings?: BookingItem[];
}

function formatDate(dateStr: string) {
  if (!dateStr) return { month: '--', day: '--' };
  const d = new Date(dateStr);
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: d.getDate().toString(),
  };
}

function getSlotInfo(booking: BookingItem) {
  const slots = booking.schedule_date_id?.slots ?? [];
  const slot = slots.find((s) => s._id === booking.schedule_slot_ids?.[0]);
  return slot?.start_time ?? 'N/A';
}

export default function NextSessions({ bookings = [] }: Props) {
  const upcoming = bookings
    .filter((b) => b.status_booking === 'confirmed' || b.status_booking === 'pending')
    .slice(0, 3);

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
      <CardHeader className="pb-2">
        <h3 className="text-[0.9rem] font-bold text-foreground m-0">Next Sessions</h3>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col gap-3">
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground m-0">No upcoming sessions.</p>
        ) : (
          upcoming.map((booking) => {
            const { month, day } = formatDate(
              booking.schedule_date_id?.date ?? booking.createdAt
            );
            const time = getSlotInfo(booking);
            return (
              <div key={booking._id} className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center bg-indigo-50 rounded-xl px-2.5 py-1.5 min-w-[42px] text-center shrink-0">
                  <span className="text-[0.55rem] font-bold text-indigo-500 tracking-widest leading-none uppercase">
                    {month}
                  </span>
                  <span className="text-[1rem] font-bold text-foreground leading-tight">{day}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[0.8rem] font-semibold text-foreground truncate">
                    {booking.package_id?.nama_paket ?? 'Booking'}
                  </span>
                  <span className="text-[0.7rem] text-muted-foreground">
                    {time} • {booking.user_id?.nama_lengkap ?? 'Client'}
                  </span>
                </div>
              </div>
            );
          })
        )}

        <Link href="/admin/schedules" className="block w-full mt-1">
          <Button
            variant="outline"
            className="w-full text-[0.78rem] h-9 border-dashed rounded-xl text-muted-foreground hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
          >
            View Full Schedule
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
