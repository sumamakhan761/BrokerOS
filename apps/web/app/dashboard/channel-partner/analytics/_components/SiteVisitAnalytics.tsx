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
  Cell,
  LineChart,
  Line,
} from "recharts";
import { BarChart2, CheckCircle2, Trophy, ArrowRight } from "lucide-react";
import { SectionHeader, COLORS } from "./shared";

export function SiteVisitAnalytics({
  siteVisitAnalytics,
}: {
  siteVisitAnalytics: any;
}) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Site Visit Analytics & Field Verification"
        subtitle="Track physical project visit completion, interest levels & monthly footfall."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 m-0">
            Visit Progress Funnel
          </h3>
          <div className="space-y-2.5">
            {[
              {
                label: "Total Scheduled",
                value: siteVisitAnalytics.svScheduled,
                icon: <BarChart2 className="text-slate-400 w-4 h-4" />,
                bg: "bg-slate-50 border-slate-100",
              },
              {
                label: "Arrived at Project Site",
                value: siteVisitAnalytics.svArrived,
                icon: <CheckCircle2 className="text-blue-500 w-4 h-4" />,
                bg: "bg-blue-50/70 border-blue-100",
              },
              {
                label: "Verified & Completed",
                value: siteVisitAnalytics.svCompleted,
                icon: <Trophy className="text-emerald-500 w-4 h-4" />,
                bg: "bg-emerald-50/70 border-emerald-100",
              },
            ].map((row, i, arr) => (
              <div key={row.label}>
                <div
                  className={`flex items-center justify-between p-3.5 rounded-2xl border ${row.bg}`}
                >
                  <div className="flex items-center gap-2.5">
                    {row.icon}
                    <span className="font-bold text-xs text-slate-800">
                      {row.label}
                    </span>
                  </div>
                  <span className="text-lg font-black text-slate-900 tabular-nums">
                    {row.value}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex justify-center -my-1 z-10">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2 m-0">
              Interest Level Post-Visit
            </h3>
            {(siteVisitAnalytics.interestLevelBreakdown?.length ?? 0) > 0 ? (
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={siteVisitAnalytics.interestLevelBreakdown}>
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
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                        fontSize: "10px",
                        fontWeight: 700,
                      }}
                    />
                    <Bar dataKey="value" name="Visits" radius={[4, 4, 0, 0]} barSize={28}>
                      {siteVisitAnalytics.interestLevelBreakdown.map(
                        (_: any, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        )
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] text-center py-6 font-semibold m-0">
                No completed visits with interest data yet.
              </p>
            )}
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2 m-0">
              Site Visits Monthly Trend
            </h3>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={siteVisitAnalytics.siteVisitsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#64748b", fontSize: 9, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 9, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0",
                      fontSize: "10px",
                      fontWeight: 700,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Site Visits"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
