import React from "react";

export function CircleProgress({
  done,
  target,
  label,
  color,
}: {
  done: number;
  target: number;
  label: string;
  color: string;
}) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const pct = target === 0 ? 0 : Math.round(Math.min(1, done / target) * 100);
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg width={96} height={96} className="-rotate-90">
          <circle
            cx={48}
            cy={48}
            r={r}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={7}
          />
          <circle
            cx={48}
            cy={48}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={7}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-extrabold text-[var(--text-primary)] tabular-nums">
            {pct}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs text-slate-700 font-bold">{label}</div>
        <div className="text-[11px] text-[var(--text-muted)] font-semibold tabular-nums mt-0.5">
          {done} / {target}
        </div>
      </div>
    </div>
  );
}
