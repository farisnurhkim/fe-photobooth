'use client';

export default function ScheduleEfficiencyHeatmap({ 
  data 
}: { 
  data: { time: string; data: { day: string; time: string; count: number }[] }[] 
}) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  
  // Find the maximum count to determine opacity scale
  let maxCount = 1;
  data.forEach(row => {
    row.data.forEach(cell => {
      if (cell.count > maxCount) maxCount = cell.count;
    });
  });

  const getOpacity = (count: number) => {
    if (count === 0) return 0.05; // Very light gray for 0
    return Math.max(0.2, count / maxCount);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col col-span-1">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-0.5">Schedule Efficiency</h3>
        <p className="text-[0.8rem] text-slate-500 m-0">Slot occupancy by time and day</p>
      </div>

      <div className="flex flex-col gap-1.5 mt-auto">
        {/* Header Row (Days) */}
        <div className="flex items-center">
          <div className="w-12 shrink-0"></div>
          <div className="flex-1 grid grid-cols-5 gap-1.5">
            {days.map(day => (
              <div key={day} className="text-center text-[0.65rem] font-semibold text-slate-400">
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap Rows */}
        {data.map((row, i) => (
          <div key={i} className="flex items-center">
            <div className="w-12 shrink-0 text-[0.7rem] font-medium text-slate-500">
              {row.time}
            </div>
            <div className="flex-1 grid grid-cols-5 gap-1.5">
              {row.data.map((cell, j) => (
                <div 
                  key={j} 
                  className="h-7 rounded bg-slate-600 transition-opacity duration-300"
                  style={{ opacity: getOpacity(cell.count) }}
                  title={`${cell.day} ${cell.time}: ${cell.count} bookings`}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="flex justify-end items-center gap-2 mt-3">
          <span className="text-[0.65rem] font-semibold text-slate-400">Low</span>
        </div>
      </div>
    </div>
  );
}
