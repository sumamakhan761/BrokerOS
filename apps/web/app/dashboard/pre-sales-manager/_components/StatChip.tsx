import React from "react";

export function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className="text-base font-extrabold tabular-nums"
        style={{ color }}
      >
        {value}
      </div>
      <div className="text-[9px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
