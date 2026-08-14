import React from "react";
import { SectionHeader } from "./shared";

export function CMLeaderboard({ cmLeaderboard }: { cmLeaderboard: any }) {
  return (
    <section>
      <SectionHeader title="Closing Manager Leaderboard" subtitle="Track how each CM is progressing bookings through the pipeline." />
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 text-slate-500 font-semibold text-xs">CM Name</th>
              <th className="text-right py-2 text-slate-500 font-semibold text-xs">Projects</th>
              <th className="text-right py-2 text-slate-500 font-semibold text-xs">Bookings</th>
              <th className="text-right py-2 text-slate-500 font-semibold text-xs">Handovers</th>
              <th className="text-right py-2 text-slate-500 font-semibold text-xs">Loan Pending</th>
              <th className="text-right py-2 text-slate-500 font-semibold text-xs">Agreement Pending</th>
              <th className="py-2 text-slate-500 font-semibold text-xs text-center">Funnel</th>
            </tr>
          </thead>
          <tbody>
            {[...cmLeaderboard.table].sort((a: any, b: any) => b.bookingsClosed - a.bookingsClosed).map((cm: any) => {
              const total = cm.funnel.confirmed || 1;
              return (
                <tr key={cm.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-semibold text-slate-800">{cm.name}</td>
                  <td className="py-3 text-right text-slate-600">{cm.projectsAssigned}</td>
                  <td className="py-3 text-right font-black text-indigo-700">{cm.bookingsClosed}</td>
                  <td className="py-3 text-right font-bold text-emerald-700">{cm.handoversDone}</td>
                  <td className="py-3 text-right text-amber-600 font-medium">{cm.loanPending}</td>
                  <td className="py-3 text-right text-rose-600 font-medium">{cm.agreementPending}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-0.5 items-end h-6">
                      {[
                        { v: cm.funnel.confirmed, color: "bg-slate-300" },
                        { v: cm.funnel.documentation, color: "bg-blue-400" },
                        { v: cm.funnel.loanAgreement, color: "bg-indigo-500" },
                        { v: cm.funnel.possession, color: "bg-amber-400" },
                        { v: cm.funnel.handover, color: "bg-emerald-500" },
                      ].map((seg, i) => (
                        <div key={i} title={`${seg.v}`} className={`${seg.color} rounded-sm w-3 transition-all`}
                          style={{ height: `${Math.max(4, (seg.v / total) * 24)}px` }} />
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
            {cmLeaderboard.table.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-slate-400 text-sm">No closing managers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
