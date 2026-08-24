"use client";

import React from "react";

export const COLORS = [
  "#9333ea",
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#8b5cf6",
  "#f43f5e",
];

export function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function Widget({
  icon,
  label,
  value,
  sub,
  accent = "indigo",
  dark = false,
}: any) {
  const accents: Record<string, string> = {
    indigo: "bg-purple-50 text-[var(--brand-700)] border border-purple-200/60",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    amber: "bg-amber-50 text-amber-700 border border-amber-200/60",
    rose: "bg-rose-50 text-rose-700 border border-rose-200/60",
    violet: "bg-purple-50 text-purple-700 border border-purple-200/60",
    sky: "bg-sky-50 text-sky-700 border border-sky-200/60",
    orange: "bg-orange-50 text-orange-700 border border-orange-200/60",
    slate: "bg-slate-50 text-slate-700 border border-slate-200/60",
    teal: "bg-teal-50 text-teal-700 border border-teal-200/60",
    purple: "bg-purple-50 text-purple-700 border border-purple-200/60",
    blue: "bg-blue-50 text-blue-700 border border-blue-200/60",
  };

  if (dark)
    return (
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-2xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${accents[accent]}`}
          >
            {icon}
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider m-0">
            {label}
          </p>
        </div>
        <div>
          <h3 className="text-2xl font-black tabular-nums tracking-tight m-0 text-white">
            {value}
          </h3>
          {sub && (
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 m-0">
              {sub}
            </p>
          )}
        </div>
      </div>
    );

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${accents[accent]}`}
        >
          {icon}
        </div>
        <p className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider m-0">
          {label}
        </p>
      </div>
      <div>
        <h3 className="text-2xl font-black text-[var(--text-primary)] tabular-nums tracking-tight m-0">
          {value}
        </h3>
        {sub && (
          <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-0.5 m-0">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-3">
      <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 m-0">
          {subtitle}
        </p>
      )}
    </div>
  );
}
