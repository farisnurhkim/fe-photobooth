import { auth } from '@/auth';
import { getFullAnalytics } from '@/lib/adminApi';
import { Calendar } from 'lucide-react';

import StatCardsRow from '@/components/admin/analytics/StatCardsRow';
import RevenueTrendsChart from '@/components/admin/analytics/RevenueTrendsChart';
import PackageDistributionChart from '@/components/admin/analytics/PackageDistributionChart';
import ScheduleEfficiencyHeatmap from '@/components/admin/analytics/ScheduleEfficiencyHeatmap';
import CancellationAnalysisChart from '@/components/admin/analytics/CancellationAnalysisChart';
import AnalyticsHeader from '@/components/admin/analytics/AnalyticsHeader';

export const metadata = {
  title: 'Analytics — SnapBook Admin',
};

export default async function AdminAnalyticsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const searchParams = await props.searchParams;
  const token = (session?.user as any)?.accessToken as string;
  const range = typeof searchParams?.range === 'string' ? parseInt(searchParams.range) : 30;

  let analyticsData: any = null;

  try {
    const res = await getFullAnalytics(token, range);
    if (res.success) {
      analyticsData = res.data;
    }
  } catch (err) {
    console.error('Analytics fetch error:', err);
  }

  if (!analyticsData) {
    return <div className="p-8">Failed to load analytics data.</div>;
  }

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-[#f8fafc] font-sans">
      <AnalyticsHeader />

      <StatCardsRow data={analyticsData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <RevenueTrendsChart data={analyticsData.revenueTrends} />
        <PackageDistributionChart data={analyticsData.packageDistribution} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScheduleEfficiencyHeatmap data={analyticsData.scheduleEfficiency} />
        <CancellationAnalysisChart data={analyticsData.cancellationAnalysis} />
      </div>
    </div>
  );
}
