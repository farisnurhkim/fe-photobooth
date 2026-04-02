import { auth } from '@/auth';
import { getDashboardAnalytics, getAdminBookings } from '@/lib/adminApi';
import StatsCard from '@/components/admin/StatsCard';
import RecentBookings from '@/components/admin/RecentBookings';
import StudioLoad from '@/components/admin/StudioLoad';
import NextSessions from '@/components/admin/NextSessions';
import EntryScannerCard from '@/components/admin/EntryScannerCard';
import { DollarSign, BookOpen, Search, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Dashboard — SnapBook Admin',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  })
    .format(amount)
    .replace('IDR', 'Rp');
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const token = (session?.user as any)?.accessToken as string;

  let analytics = {
    totalRevenue: 0,
    revenueGrowth: 0,
    bookingCount: 0,
    bookingGrowth: 0,
    revenueTrend: [] as any[],
    bookingMix: [] as any[],
    bookingDensity: [] as any[],
  };
  let bookingsData = { data: [] as any[], totalData: 0, totalPages: 1, currentPage: 1 };

  try {
    const [analyticsRes, bookingsRes] = await Promise.all([
      getDashboardAnalytics(token),
      getAdminBookings(token, 1, 5),
    ]);
    analytics = analyticsRes.data;
    bookingsData = bookingsRes;
  } catch (err) {
    console.error('Dashboard fetch error:', err);
  }

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-[#f4f6f9]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-7 gap-4">
        <div>
          <h1 className="text-2xl lg:text-[1.875rem] font-bold text-foreground leading-tight m-0 mb-1">Overview</h1>
          <p className="text-sm text-muted-foreground m-0">
            Monitor your studio&apos;s performance and bookings.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex items-center">
            <Search size={15} className="absolute left-3 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-9 h-9 w-full sm:w-[200px] text-sm rounded-xl bg-white border-border"
              placeholder="Search analytics..."
              aria-label="Search analytics"
            />
          </div>
          <Button variant="outline" className="h-9 rounded-xl gap-2 text-sm bg-white border-border justify-start font-medium">
            <Calendar size={14} />
            Last 30 Days
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5 md:mb-8">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          growth={analytics.revenueGrowth}
          icon={DollarSign}
        />
        <StatsCard
          title="Booking Count"
          value={analytics.bookingCount.toLocaleString()}
          growth={analytics.bookingGrowth}
          icon={BookOpen}
        />
        <EntryScannerCard />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5 items-start">
        {/* Left — Bookings Table */}
        <div className="order-2 xl:order-1 overflow-x-auto">
          <RecentBookings
            initialData={bookingsData.data}
            totalData={bookingsData.totalData}
            totalPages={bookingsData.totalPages}
          />
        </div>

        {/* Right — Widgets */}
        <div className="order-1 xl:order-2 flex flex-col sm:grid sm:grid-cols-2 xl:flex xl:flex-col gap-5">
          <StudioLoad bookingMix={analytics.bookingMix} />
          <NextSessions bookings={bookingsData.data} />
        </div>
      </div>
    </div>
  );
}
