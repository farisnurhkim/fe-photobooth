'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#64748b', '#83734a', '#cbd5e1'];

export default function CancellationAnalysisChart({ 
  data 
}: { 
  data: { reason: string; count: number; percentage: number }[] 
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col col-span-1">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-0.5">Cancellation Analysis</h3>
        <p className="text-[0.8rem] text-slate-500 m-0">Breakdown of cancellation reasons</p>
      </div>

      <div className="flex items-center mt-auto gap-4">
        {/* Chart */}
        <div className="w-[120px] h-[120px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                stroke="none"
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 rounded shadow-lg text-xs font-medium text-slate-700 border border-slate-100">
                        {data.reason}: {data.count} ({data.percentage}%)
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 flex-1">
          {data.map((item, index) => (
            <div key={index} className="flex gap-2">
              <div 
                className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex flex-col">
                <span className="text-[0.8rem] font-medium text-slate-800 leading-tight">
                  {item.reason}
                </span>
                <span className="text-[0.7rem] text-slate-500 mt-0.5">
                  {item.percentage}% ({item.count} cases)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
