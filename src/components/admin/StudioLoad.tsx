import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface BookingMixItem {
  paket: string;
  count: number;
  percentage: number;
}

interface Props {
  bookingMix: BookingMixItem[];
}

const BAR_COLORS = ['#eab308', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function StudioLoad({ bookingMix }: Props) {
  const studios = bookingMix.slice(0, 3);

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white">
      <CardHeader className="pb-2">
        <h3 className="text-[0.9rem] font-bold text-foreground m-0">Studio Load</h3>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col gap-4">
        {studios.length === 0 ? (
          <p className="text-sm text-muted-foreground m-0">No data available.</p>
        ) : (
          studios.map((item, i) => (
            <div key={item.paket} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[0.78rem] font-medium text-foreground">{item.paket}</span>
                <span className="text-[0.75rem] font-semibold text-muted-foreground">{item.percentage}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%`, backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
