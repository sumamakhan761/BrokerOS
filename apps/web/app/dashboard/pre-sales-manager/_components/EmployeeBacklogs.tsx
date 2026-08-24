"use client";

import React from "react";
import { EmployeeDashboardData } from "./types";
import { ArchiveRestore, CheckCircle2 } from "lucide-react";

export function EmployeeBacklogs({
  backlogs,
  hasBacklog,
}: {
  backlogs: EmployeeDashboardData["backlogs"];
  hasBacklog: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-3xl p-6 shadow-2xs border ${
        hasBacklog ? "border-rose-200" : "border-slate-200/80"
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`w-7 h-7 rounded-xl flex items-center justify-center ${
            hasBacklog
              ? "bg-rose-50 text-rose-700"
              : "bg-purple-50 text-[var(--brand-700)]"
          }`}
        >
          <ArchiveRestore size={14} />
        </div>
        <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
          Agent Backlogs
        </h2>
      </div>

      {!hasBacklog ? (
        <div className="text-center py-6 text-[var(--text-muted)] flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-2xs">
            <CheckCircle2 size={18} />
          </div>
          <span className="text-xs font-bold text-slate-700 mt-1">
            All caught up!
          </span>
          <span className="text-[11px] font-medium text-[var(--text-muted)]">
            No missed follow-ups or cold call debt
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {backlogs.coldCallBacklogCount > 0 && (
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-rose-900">
                  Cold Call Backlog
                </span>
                <span className="bg-rose-200 text-rose-900 rounded-full px-2 py-0.5 text-xs font-extrabold tabular-nums">
                  {backlogs.coldCallBacklogCount}
                </span>
              </div>
            </div>
          )}

          {backlogs.missedFollowUps.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-900">
                  Missed Follow-ups
                </span>
                <span className="bg-amber-200 text-amber-900 rounded-full px-2 py-0.5 text-xs font-extrabold tabular-nums">
                  {backlogs.missedFollowUps.length}
                </span>
              </div>
              <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
                {backlogs.missedFollowUps.slice(0, 5).map((fu) => (
                  <div
                    key={fu.id}
                    className="flex justify-between items-center text-xs py-1 border-b border-amber-200/50 last:border-0"
                  >
                    <span className="text-amber-900 font-bold truncate max-w-[140px]">
                      {fu.lead
                        ? `${fu.lead.firstName} ${fu.lead.lastName || ""}`.trim()
                        : "Lead"}
                    </span>
                    <span className="text-amber-800/80 text-[10px] font-semibold tabular-nums">
                      {new Date(fu.scheduledDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
