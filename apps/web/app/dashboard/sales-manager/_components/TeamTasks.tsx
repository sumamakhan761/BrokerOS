"use client";

import { Calendar, CheckCircle2, Clock } from "lucide-react";
import { DashboardData } from "./types";
import Link from "next/link";

export function TeamTasks({ data }: { data: DashboardData }) {
  const { todaySiteVisitList, todayFollowUpList } = data;

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
            <Calendar size={15} />
          </div>
          <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
            Today's Team Tasks & Site Visits
          </h2>
        </div>

        <div className="space-y-5 max-h-[380px] overflow-y-auto pr-1">
          {/* Site Visits */}
          <div>
            <div className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-100">
              Site Visits Scheduled
            </div>
            {todaySiteVisitList.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic m-0">
                No site visits scheduled for today.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {todaySiteVisitList.map((sv) => (
                  <Link
                    href={`/dashboard/sales-manager/lead-management/${sv.lead?.id}`}
                    key={sv.id}
                    className="flex justify-between items-center p-3 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-200 transition-all no-underline"
                  >
                    <div>
                      <p className="m-0 text-xs font-bold text-[var(--text-primary)]">
                        {sv.lead?.firstName} {sv.lead?.lastName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] uppercase font-extrabold text-[var(--brand-700)] bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/60">
                          {sv.salesExec?.name || "Executive"}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {sv.project?.name || "No Project"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="m-0 text-xs font-extrabold text-[var(--brand-700)] tabular-nums">
                        {new Date(sv.scheduledDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="m-0 mt-0.5 text-[9px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                        {sv.status.replace(/_/g, " ")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Follow-ups */}
          <div>
            <div className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-100">
              Team Follow-ups Due
            </div>
            {todayFollowUpList.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic m-0">
                No follow-ups scheduled for today.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {todayFollowUpList.map((fup) => (
                  <Link
                    href={`/dashboard/sales-manager/lead-management/${fup.lead?.id}`}
                    key={fup.id}
                    className="flex justify-between items-center p-3 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-200 transition-all no-underline"
                  >
                    <div>
                      <p className="m-0 text-xs font-bold text-[var(--text-primary)]">
                        {fup.lead?.firstName} {fup.lead?.lastName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] uppercase font-extrabold text-slate-600 bg-slate-200/70 px-1.5 py-0.5 rounded">
                          {fup.user?.name || "Agent"}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider border ${
                            fup.lead?.temperature === "HOT"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : fup.lead?.temperature === "WARM"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {fup.lead?.temperature || "COLD"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="m-0 text-xs font-extrabold text-[var(--brand-700)] tabular-nums">
                        {new Date(fup.scheduledDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {fup.status === "COMPLETED" ? (
                        <CheckCircle2 size={13} className="text-emerald-600 mt-1" />
                      ) : (
                        <Clock size={13} className="text-amber-600 mt-1" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
