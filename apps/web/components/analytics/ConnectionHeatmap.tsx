import React, { useMemo } from 'react';

interface HeatmapData {
  day: number;
  hour: number;
  count: number;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function ConnectionHeatmap({ data }: { data: HeatmapData[] }) {
  const maxCount = useMemo(() => {
    return Math.max(...data.map(d => d.count), 1);
  }, [data]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-50 dark:bg-slate-300/50';
    const intensity = count / maxCount;
    // Map intensity to a green shade from Tailwind's green palette
    if (intensity < 0.2) return 'bg-green-200';
    if (intensity < 0.4) return 'bg-green-300';
    if (intensity < 0.6) return 'bg-green-400';
    if (intensity < 0.8) return 'bg-green-500';
    return 'bg-green-600';
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[700px] max-w-[800px]">
        {/* Header - Hours */}
        <div className="flex mb-2">
          <div className="w-12 shrink-0"></div>
          {HOURS.map(hour => (
            <div key={hour} className="flex-1 text-[10px] text-center font-medium text-default-400">
              {hour % 12 === 0 ? 12 : hour % 12}{hour >= 12 ? 'p' : 'a'}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex flex-col gap-1">
          {DAYS.map((dayName, dayIdx) => (
            <div key={dayName} className="flex items-center gap-1">
              <div className="w-12 shrink-0 text-xs font-semibold text-default-500">
                {dayName}
              </div>
              {HOURS.map(hour => {
                const cellData = data.find(d => d.day === dayIdx && d.hour === hour) || { count: 0 };
                return (
                  <div
                    key={`${dayIdx}-${hour}`}
                    className={`flex-1 h-6 rounded-sm ${getColor(cellData.count)} transition-colors`}
                    title={`${dayName} ${hour % 12 === 0 ? 12 : hour % 12}${hour >= 12 ? 'pm' : 'am'} - ${cellData.count} connected calls`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-default-500 font-medium">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-slate-50 dark:bg-slate-300/50"></div>
            <div className="w-3 h-3 rounded-sm bg-green-200"></div>
            <div className="w-3 h-3 rounded-sm bg-green-400"></div>
            <div className="w-3 h-3 rounded-sm bg-green-600"></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
