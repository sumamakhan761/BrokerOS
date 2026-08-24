"use client";

import Link from "next/link";
import { CheckCircle2, PhoneCall, Calendar } from "lucide-react";
import { Avatar } from "./Avatar";

export interface FollowUpItem {
  id: string;
  status: string;
  scheduledDate?: string;
  lead?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    status?: string;
    temperature?: string;
    phone?: string;
  };
  customer?: {
    id?: string;
    firstName?: string;
    lastName?: string;
  };
}

const TEMP_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  HOT: { bg: "bg-rose-50 border-rose-200", text: "text-rose-700", label: "Hot" },
  WARM: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", label: "Warm" },
  COLD: { bg: "bg-sky-50 border-sky-200", text: "text-sky-700", label: "Cold" },
};

export function FollowUpList({
  items,
  onConfirm,
  viewAllHref,
  title = "Today's Follow-ups",
}: {
  items: FollowUpItem[];
  onConfirm?: (id: string) => void;
  viewAllHref?: string;
  title?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs font-bold text-[var(--text-primary)] tracking-tight">
          {title}
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
          Today
        </span>
      </div>

      {/* Body */}
      {!items || items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-8 text-xs font-medium text-[var(--text-muted)]">
          No follow-ups scheduled for today.
        </div>
      ) : (
        <div className="flex-1 divide-y divide-slate-100">
          {items.map((fu) => {
            const name = fu.lead
              ? `${fu.lead.firstName ?? ""} ${fu.lead.lastName ?? ""}`.trim()
              : fu.customer
              ? `${fu.customer.firstName ?? ""} ${fu.customer.lastName ?? ""}`.trim()
              : "Unknown";
            const temp = fu.lead?.temperature;
            const tempStyle = temp ? TEMP_STYLES[temp] : null;
            const isActionable = ["SCHEDULED", "RESCHEDULED", "MISSED"].includes(fu.status);

            return (
              <div
                key={fu.id}
                className="flex items-center justify-between py-3 gap-3 first:pt-0 last:pb-0"
              >
                {/* Left: Avatar + Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar name={name.split(" ")[0]} size={32} />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {name || "—"}
                    </div>
                    <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5 truncate">
                      {fu.lead?.status ?? fu.lead?.phone ?? "—"}
                    </div>
                  </div>
                </div>

                {/* Right: Temp Badge + Action */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  {tempStyle && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tempStyle.bg} ${tempStyle.text}`}
                    >
                      {tempStyle.label}
                    </span>
                  )}
                  {onConfirm && isActionable ? (
                    <button
                      onClick={() => onConfirm(fu.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[11px] font-bold transition-all active:scale-[0.96] press-effect cursor-pointer"
                    >
                      <CheckCircle2 size={12} />
                      <span>Confirm</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 size={12} />
                      <span>Done</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Link */}
      {viewAllHref && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <Link
            href={viewAllHref}
            className="block text-center text-xs font-bold text-[var(--brand-700)] bg-purple-50 hover:bg-purple-100/80 border border-purple-200/70 py-2 rounded-xl transition-all active:scale-[0.98] press-effect text-decoration-none"
          >
            See All Scheduled Follow-ups
          </Link>
        </div>
      )}
    </div>
  );
}
