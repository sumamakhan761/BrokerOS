import React from "react";
import { PhoneCall } from "lucide-react";

interface CallOutcomesProps {
  outcomes: {
    connected: number;
    notAnswered: number;
    busy: number;
    failed: number;
    voicemail: number;
  };
}

export function CallOutcomes({ outcomes }: CallOutcomesProps) {
  const total =
    outcomes.connected +
    outcomes.notAnswered +
    outcomes.busy +
    outcomes.failed +
    outcomes.voicemail;

  const getWidth = (val: number) => {
    if (total === 0) return 0;
    return (val / total) * 100;
  };

  const categories = [
    {
      label: "Connected",
      value: outcomes.connected,
      color: "bg-emerald-500",
      text: "text-emerald-800",
      bg: "bg-emerald-50/70 border-emerald-200/80",
    },
    {
      label: "Not Answered",
      value: outcomes.notAnswered,
      color: "bg-amber-500",
      text: "text-amber-800",
      bg: "bg-amber-50/70 border-amber-200/80",
    },
    {
      label: "Busy",
      value: outcomes.busy,
      color: "bg-orange-500",
      text: "text-orange-800",
      bg: "bg-orange-50/70 border-orange-200/80",
    },
    {
      label: "Voicemail",
      value: outcomes.voicemail,
      color: "bg-sky-500",
      text: "text-sky-800",
      bg: "bg-sky-50/70 border-sky-200/80",
    },
    {
      label: "Failed",
      value: outcomes.failed,
      color: "bg-rose-500",
      text: "text-rose-800",
      bg: "bg-rose-50/70 border-rose-200/80",
    },
  ]
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="w-full space-y-4 animate-enter">
      {/* Visual Stacked Bar */}
      <div className="flex w-full h-3.5 rounded-full overflow-hidden bg-slate-100 p-0.5 border border-slate-200/60 shadow-2xs">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            style={{ width: `${getWidth(cat.value)}%` }}
            className={`h-full ${cat.color} first:rounded-l-full last:rounded-r-full transition-all duration-500 hover:opacity-90`}
            title={`${cat.label}: ${cat.value} (${Math.round(getWidth(cat.value))}%)`}
          />
        ))}
        {total === 0 && (
          <div className="w-full h-full bg-slate-200 rounded-full" />
        )}
      </div>

      {/* Legend & Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between p-3 rounded-2xl border ${cat.bg} transition-all shadow-2xs`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${cat.color} shadow-2xs`} />
              <span className={`text-xs font-bold ${cat.text}`}>
                {cat.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-[var(--text-primary)] tabular-nums">
                {cat.value}
              </span>
              <span className="text-[10px] font-semibold text-[var(--text-muted)] tabular-nums">
                ({Math.round(getWidth(cat.value))}%)
              </span>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full text-center py-6 text-xs font-semibold text-[var(--text-muted)] bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center gap-2">
            <PhoneCall size={14} className="text-slate-300" />
            <span>No call outcomes recorded in this period.</span>
          </div>
        )}
      </div>
    </div>
  );
}
