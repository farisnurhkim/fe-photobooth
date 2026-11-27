import { auth } from '@/auth';
import { getDashboardAnalytics, getAdminBookings, type AnalyticsData } from '@/lib/adminApi';
import StatsCard from '@/components/admin/StatsCard';
import RecentBookings from '@/components/admin/RecentBookings';
import StudioLoad from '@/components/admin/StudioLoad';
import NextSessions from '@/components/admin/NextSessions';
import EntryScannerCard from '@/components/admin/EntryScannerCard';
import { DollarSign, BookOpen } from 'lucide-react';
import DashboardHeader from '@/components/admin/DashboardHeader';

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

export default async function AdminDashboardPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const searchParams = await props.searchParams;
  const token = (session?.user as any)?.accessToken as string;
  const range = typeof searchParams?.range === 'string' ? parseInt(searchParams.range) : 30;

  let analytics: AnalyticsData = {
    totalRevenue: 0,
    revenueGrowth: 0,
    bookingCount: 0,
    bookingGrowth: 0,
    revenueTrend: [],
    bookingMix: [],
    bookingDensity: [],
    upcomingSessions: [],
  };
  let bookingsData = { data: [] as any[], totalData: 0, totalPages: 1, currentPage: 1 };

  try {
    const [analyticsRes, bookingsRes] = await Promise.all([
      getDashboardAnalytics(token, range),
      getAdminBookings(token, 1, 5),
    ]);
    analytics = analyticsRes.data;
    bookingsData = bookingsRes;
  } catch (err) {
    console.error('Dashboard fetch error:', err);
  }

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-[#f4f6f9]">
      <DashboardHeader />

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
          <NextSessions bookings={analytics.upcomingSessions || []} />
        </div>
      </div>
    </div>
  );
}
