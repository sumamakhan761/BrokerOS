"use client";

import { MapPin } from "lucide-react";
import LiveTrackingMap from "@/components/LiveTrackingMap";

export function LiveMapCard({
  userId,
  title = "My Live Location",
  subtitle,
}: {
  userId: string | null | undefined;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
      {/* Card Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-700 flex-shrink-0">
            <MapPin size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--text-primary)] tracking-tight">
              {title}
            </div>
            {subtitle && (
              <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live GPS</span>
        </div>
      </div>

      {/* Map Area */}
      <div className="p-4">
        {userId ? (
          <LiveTrackingMap userId={userId} />
        ) : (
          <div className="h-80 bg-slate-50 rounded-xl flex flex-col items-center justify-center gap-2.5 border border-dashed border-slate-200">
            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-purple-600 animate-spin" />
            <p className="text-xs font-medium text-[var(--text-muted)]">
              Connecting to GPS stream…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
