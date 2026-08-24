"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { SectionHeader } from "./shared";

export function SMLeaderboard({ smLeaderboard }: { smLeaderboard: any }) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Sourcing Manager Leaderboard"
        subtitle="Evaluate partner development, active broker counts & deal sourcing velocity."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs overflow-x-auto flex flex-col justify-between">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 m-0">
            SM Roster Performance
          </h3>
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left py-2.5 px-3 text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider">
                  Manager Name
                </th>
                <th className="text-right py-2.5 px-3 text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider">
                  Active
                </th>
                <th className="text-right py-2.5 px-3 text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider">
                  New
                </th>
                <th className="text-right py-2.5 px-3 text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider">
                  Meetings
                </th>
                <th className="text-right py-2.5 px-3 text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider">
                  Deals
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...smLeaderboard.table]
                .sort((a: any, b: any) => b.bookingsVia - a.bookingsVia)
                .map((sm: any) => (
                  <tr
                    key={sm.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-bold text-[var(--text-primary)]">
                      {sm.name}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-extrabold tabular-nums">
                      {sm.activeBrokers}
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-600 font-bold tabular-nums">
                      {sm.newBrokers}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 font-medium tabular-nums">
                      {sm.meetings}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[var(--brand-700)] font-black tabular-nums">
                      {sm.bookingsVia}
                    </td>
                  </tr>
                ))}
              {smLeaderboard.table.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-xs font-semibold text-[var(--text-muted)]"
                  >
                    No sourcing managers registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 m-0">
            SM Deal Contribution (Bookings via Network)
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={smLeaderboard.contributionChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                />
                <Bar
                  dataKey="bookings"
                  name="Deals Closed"
                  fill="#9333ea"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
