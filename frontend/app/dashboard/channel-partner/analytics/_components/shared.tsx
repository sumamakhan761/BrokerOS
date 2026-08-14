import React from "react";

export const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export function Widget({ icon, label, value, sub, accent = "indigo", dark = false }: any) {
  const accents: Record<string, string> = {
    indigo: "bg-indigo-100 text-indigo-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    rose: "bg-rose-100 text-rose-600",
    violet: "bg-violet-100 text-violet-600",
    sky: "bg-sky-100 text-sky-600",
    orange: "bg-orange-100 text-orange-600",
    slate: "bg-slate-100 text-slate-600",
    teal: "bg-teal-100 text-teal-600",
    purple: "bg-purple-100 text-purple-600",
  };
  if (dark) return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-sm relative overflow-hidden group">
      <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl" />
      <div className="relative z-10 flex flex-col gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accents[accent]}`}>{icon}</div>
        <div>
          <p className="text-xs font-bold text-slate-400 mb-0.5">{label}</p>
          <h3 className="text-2xl font-black">{value}</h3>
          {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 w-20 h-20 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
      <div className="relative z-10 flex flex-col gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accents[accent]}`}>{icon}</div>
        <div>
          <p className="text-xs font-bold text-slate-500 mb-0.5">{label}</p>
          <h3 className="text-2xl font-black text-slate-900">{value}</h3>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}
