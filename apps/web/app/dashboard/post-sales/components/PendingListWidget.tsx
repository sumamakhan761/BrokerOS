"use client";

import Link from "next/link";
import { LeadListItem } from "../types";
import { Avatar } from "@/components/dashboard/Avatar";
import { ChevronRight } from "lucide-react";

interface PendingListWidgetProps {
  title: string;
  list: LeadListItem[];
  statusFilter: string;
  emptyMessage?: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  DOCUMENT: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  LOAN: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
  AGREEMENT: { bg: "bg-purple-50", text: "text-[var(--brand-700)]", border: "border-purple-200" },
  HANDOVER: { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
};

export function PendingListWidget({
  title,
  list,
  statusFilter,
  emptyMessage = "No pending items.",
}: PendingListWidgetProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
            {title}
          </h2>
          <span className="text-[10px] font-extrabold text-[var(--text-muted)] bg-slate-100 px-2 py-0.5 rounded-full tabular-nums">
            {list.length}
          </span>
        </div>

        {list.length === 0 ? (
          <div className="py-10 flex items-center justify-center text-xs font-semibold text-[var(--text-muted)] text-center">
            {emptyMessage}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
            {list.map((lead) => {
              const badgeStyle = STATUS_COLORS[lead.status] || {
                bg: "bg-slate-50",
                text: "text-slate-700",
                border: "border-slate-200",
              };
              return (
                <Link
                  href={`/dashboard/post-sales/lead-management/${lead.id}`}
                  key={lead.id}
                  className="flex items-center justify-between py-2.5 px-2 rounded-xl hover:bg-slate-50 transition-colors no-underline group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={lead.firstName} size={30} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--brand-700)] transition-colors">
                        {`${lead.firstName} ${lead.lastName || ""}`.trim()}
                      </div>
                      <div className="text-[10px] font-semibold text-[var(--text-muted)] mt-0.5 tabular-nums truncate">
                        {lead.phone || "No phone"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                    >
                      {lead.subStatus && lead.status === "HANDOVER"
                        ? lead.subStatus
                        : lead.status}
                    </span>
                    <ChevronRight size={13} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100">
        <Link
          href={`/dashboard/post-sales/lead-management?status=${statusFilter}`}
          className="block text-center text-xs font-bold text-[var(--brand-700)] hover:text-purple-900 bg-purple-50/70 hover:bg-purple-100/70 py-2 rounded-xl transition-all border border-purple-200/50 no-underline shadow-2xs active:scale-[0.98]"
        >
          View all {title.toLowerCase()}
        </Link>
      </div>
    </div>
  );
}
