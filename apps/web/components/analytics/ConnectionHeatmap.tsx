import React, { useMemo } from "react";

interface HeatmapData {
  day: number;
  hour: number;
  count: number;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function ConnectionHeatmap({ data }: { data: HeatmapData[] }) {
  const maxCount = useMemo(() => {
    return Math.max(...data.map((d) => d.count), 1);
  }, [data]);

  const getColor = (count: number) => {
    if (count === 0) return "bg-slate-100/80 border-slate-200/50";
    const intensity = count / maxCount;
    if (intensity < 0.25)
      return "bg-emerald-200 border-emerald-300 text-emerald-900";
    if (intensity < 0.5)
      return "bg-emerald-400 border-emerald-500 text-white";
    if (intensity < 0.75)
      return "bg-emerald-600 border-emerald-700 text-white";
    return "bg-emerald-700 border-emerald-800 text-white";
  };

  return (
    <div className="w-full overflow-x-auto pb-2 animate-enter">
      <div className="min-w-[650px] max-w-[800px]">
        {/* Header - Hours */}
        <div className="flex mb-1.5 pl-10">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="flex-1 text-[9px] text-center font-bold text-[var(--text-muted)] tabular-nums"
            >
              {hour % 12 === 0 ? 12 : hour % 12}
              {hour >= 12 ? "p" : "a"}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex flex-col gap-1">
          {DAYS.map((dayName, dayIdx) => (
            <div key={dayName} className="flex items-center gap-1.5">
              <div className="w-8 shrink-0 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                {dayName}
              </div>
              <div className="flex flex-1 gap-1">
                {HOURS.map((hour) => {
                  const cellData = data.find(
                    (d) => d.day === dayIdx && d.hour === hour
                  ) || { count: 0 };
                  return (
                    <div
                      key={`${dayIdx}-${hour}`}
                      className={`flex-1 h-5 rounded-md border ${getColor(
                        cellData.count
                      )} transition-all hover:scale-110 cursor-pointer shadow-2xs`}
                      title={`${dayName} ${
                        hour % 12 === 0 ? 12 : hour % 12
                      }${hour >= 12 ? "pm" : "am"} • ${
                        cellData.count
                      } connected calls`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-[var(--text-muted)] font-bold">
          <span>Less</span>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 rounded-md bg-slate-100 border border-slate-200" />
            <div className="w-3 h-3 rounded-md bg-emerald-200 border border-emerald-300" />
            <div className="w-3 h-3 rounded-md bg-emerald-400 border border-emerald-500" />
            <div className="w-3 h-3 rounded-md bg-emerald-600 border border-emerald-700" />
            <div className="w-3 h-3 rounded-md bg-emerald-700 border border-emerald-800" />
          </div>
          <span>More Connections</span>
        </div>
      </div>
    </div>
  );
}
