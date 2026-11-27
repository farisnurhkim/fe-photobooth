'use client';

export default function PackageDistributionChart({ data }: { data: { name: string; value: number }[] }) {
  // Find max value to scale the bars relative to the highest percentage
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col col-span-1">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-0.5">Package Distribution</h3>
        <p className="text-[0.8rem] text-slate-500 m-0">Bookings by package type</p>
      </div>

      <div className="flex flex-col gap-4 mt-auto mb-2">
        {data.map((item, index) => {
          // Calculate width percentage relative to max, or absolute if preferred.
          // The design shows absolute percentages.
          const widthPct = item.value;
          
          return (
            <div key={index} className="flex items-center gap-3">
              <span className="text-[0.8rem] font-medium text-slate-700 w-24 shrink-0">{item.name}</span>
              <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-600 rounded-full" 
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              <span className="text-[0.8rem] font-semibold text-slate-500 w-10 text-right shrink-0">{item.value}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
