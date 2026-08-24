import React from "react";
import { CheckCircle2, PhoneMissed, CalendarClock, AlertCircle } from "lucide-react";

export interface MissedFollowUp {
  id: string;
  scheduledDate: string;
  lead?: { firstName?: string; lastName?: string };
  customer?: { firstName?: string; lastName?: string };
}

export function BacklogPanel({
  coldCallBacklogCount = 0,
  missedFollowUps = [],
}: {
  coldCallBacklogCount?: number;
  missedFollowUps?: MissedFollowUp[];
}) {
  const hasBacklog = coldCallBacklogCount > 0 || missedFollowUps.length > 0;

  return (
    <div
      className={`bg-white rounded-2xl p-6 border ${
        hasBacklog ? "border-rose-200" : "border-slate-200/80"
      } shadow-xs transition-colors duration-200`}
    >
      <div className="flex items-center gap-2 mb-4">
        {hasBacklog ? (
          <AlertCircle size={16} className="text-rose-600" />
        ) : (
          <CheckCircle2 size={16} className="text-emerald-600" />
        )}
        <div
          className={`text-xs font-bold tracking-tight ${
            hasBacklog ? "text-rose-700" : "text-[var(--text-primary)]"
          }`}
        >
          Urgent Backlogs
        </div>
      </div>

      {!hasBacklog ? (
        <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
          <span className="text-xs font-semibold text-[var(--text-muted)]">
            All caught up! Zero pending backlogs.
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Cold call backlog */}
          {coldCallBacklogCount > 0 && (
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PhoneMissed size={14} className="text-rose-600 flex-shrink-0" />
                  <span className="text-xs font-bold text-rose-900">
                    Cold Call Backlog
                  </span>
                </div>
                <span className="bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full text-[11px] font-extrabold tabular-nums">
                  {coldCallBacklogCount}
                </span>
              </div>
              <p className="text-[11px] font-medium text-rose-700 mt-1 mb-0">
                Call {coldCallBacklogCount} new lead{coldCallBacklogCount > 1 ? "s" : ""} to clear queue
              </p>
            </div>
          )}

          {/* Missed follow-ups */}
          {missedFollowUps.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
              <div className="flex justify-between items-center mb-2.5">
                <div className="flex items-center gap-2">
                  <CalendarClock size={14} className="text-amber-700 flex-shrink-0" />
                  <span className="text-xs font-bold text-amber-900">
                    Missed Follow-ups
                  </span>
                </div>
                <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full text-[11px] font-extrabold tabular-nums">
                  {missedFollowUps.length}
                </span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {missedFollowUps.slice(0, 6).map((fu) => {
                  const firstName = fu.lead?.firstName ?? fu.customer?.firstName ?? "";
                  const lastName = fu.lead?.lastName ?? fu.customer?.lastName ?? "";
                  const name = `${firstName} ${lastName}`.trim() || "—";
                  return (
                    <div
                      key={fu.id}
                      className="flex justify-between items-center text-xs py-1 border-b border-amber-100/80 last:border-none"
                    >
                      <span className="font-semibold text-amber-900 truncate">
                        {name}
                      </span>
                      <span className="text-[11px] font-medium text-amber-700 tabular-nums flex-shrink-0 ml-2">
                        {new Date(fu.scheduledDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
