"use client";

import React from "react";
import { SectionHeader } from "./shared";

export function CMLeaderboard({ cmLeaderboard }: { cmLeaderboard: any }) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Closing Manager Leaderboard & Pipeline Progression"
        subtitle="Track how effectively each CM advances customer transactions across legal & bank stages."
      />
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left py-2.5 px-3 text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider">
                CM Name
              </th>
              <th className="text-right py-2.5 px-3 text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider">
                Projects
              </th>
              <th className="text-right py-2.5 px-3 text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider">
                Bookings
              </th>
              <th className="text-right py-2.5 px-3 text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider">
                Handovers
              </th>
              <th className="text-right py-2.5 px-3 text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider">
                Loan In-Progress
              </th>
              <th className="text-right py-2.5 px-3 text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider">
                Agreement Pending
              </th>
              <th className="py-2.5 px-3 text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider text-center">
                Stage Mini-Funnel
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[...cmLeaderboard.table]
              .sort((a: any, b: any) => b.bookingsClosed - a.bookingsClosed)
              .map((cm: any) => {
                const total = cm.funnel.confirmed || 1;
                return (
                  <tr
                    key={cm.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-[var(--text-primary)]">
                      {cm.name}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600 font-semibold tabular-nums">
                      {cm.projectsAssigned}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-[var(--brand-700)] tabular-nums">
                      {cm.bookingsClosed}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700 tabular-nums">
                      {cm.handoversDone}
                    </td>
                    <td className="py-3 px-3 text-right text-amber-700 font-bold tabular-nums">
                      {cm.loanPending}
                    </td>
                    <td className="py-3 px-3 text-right text-purple-700 font-bold tabular-nums">
                      {cm.agreementPending}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1 items-end justify-center h-6">
                        {[
                          { v: cm.funnel.confirmed, color: "bg-slate-300" },
                          { v: cm.funnel.documentation, color: "bg-blue-400" },
                          {
                            v: cm.funnel.loanAgreement,
                            color: "bg-[var(--brand-600)]",
                          },
                          { v: cm.funnel.possession, color: "bg-amber-400" },
                          { v: cm.funnel.handover, color: "bg-emerald-500" },
                        ].map((seg, i) => (
                          <div
                            key={i}
                            title={`${seg.v}`}
                            className={`${seg.color} rounded-xs w-2.5 transition-all duration-300`}
                            style={{
                              height: `${Math.max(
                                4,
                                (seg.v / total) * 22
                              )}px`,
                            }}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            {cmLeaderboard.table.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-xs font-semibold text-[var(--text-muted)]"
                >
                  No closing managers registered.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
