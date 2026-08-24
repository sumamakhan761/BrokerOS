import React from "react";
import { LucideIcon } from "lucide-react";

export interface StatCardItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Hex color, OKLCH or CSS var for the icon and accent */
  accent: string;
  /** Optional background tint */
  bg?: string;
  /** Optional subtitle under the value */
  sub?: string;
}

export function StatCards({
  items,
  cols,
}: {
  items: StatCardItem[];
  /** grid columns override — defaults to auto-fit minmax(190px) */
  cols?: number;
}) {
  const gridClasses = cols
    ? `grid grid-cols-1 sm:grid-cols-${cols} gap-4`
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4";

  return (
    <div className={gridClasses}>
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover-lift overflow-hidden transition-all duration-200 cursor-default animate-enter"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {/* Background Ambient Glow */}
            <div
              className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none opacity-10"
              style={{ background: item.accent }}
            />

            {/* Icon Header */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 relative"
              style={{
                background: item.bg || `color-mix(in oklch, ${item.accent} 12%, transparent)`,
              }}
            >
              <Icon size={18} strokeWidth={2.2} style={{ color: item.accent }} />
            </div>

            {/* Metric Value */}
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] tabular-nums leading-none mb-1.5">
              {item.value}
            </div>

            {/* Label */}
            <div className="text-xs font-bold text-[var(--text-secondary)] tracking-tight">
              {item.label}
            </div>

            {/* Optional Subtitle */}
            {item.sub && (
              <div className="text-[11px] font-medium text-[var(--text-muted)] mt-1">
                {item.sub}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
