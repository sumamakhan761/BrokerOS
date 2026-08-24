"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { SectionHeader, COLORS } from "./shared";

export function BrokerPerformance({
  brokerPerformance,
}: {
  brokerPerformance: any;
}) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Broker Network Performance & Pipeline Health"
        subtitle="Top partner rankings, activation benchmarks, and onboarding velocity."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs overflow-hidden">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 m-0">
            Top 10 External Brokers by Deal Volume
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left py-2.5 px-3 text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider">
                    #
                  </th>
                  <th className="text-left py-2.5 px-3 text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider">
                    Broker
                  </th>
                  <th className="text-left py-2.5 px-3 text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider">
                    Assigned SM
                  </th>
                  <th className="text-right py-2.5 px-3 text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="text-right py-2.5 px-3 text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider">
                    Units Sold
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {brokerPerformance.topBrokers.map((b: any) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-extrabold text-[var(--text-muted)] tabular-nums">
                      #{b.rank}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[var(--text-primary)]">
                      {b.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      {b.smName}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-[var(--brand-700)] tabular-nums">
                      {b.bookings}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-700 tabular-nums">
                      {b.unitsSold}
                    </td>
                  </tr>
                ))}
                {brokerPerformance.topBrokers.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-xs font-semibold text-[var(--text-muted)]"
                    >
                      No broker booking data recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-0.5 m-0">
              Broker Activation Ratio
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] font-medium mb-3 m-0">
              Brokers closing ≥ 1 deal
            </p>
            <div className="flex items-center gap-4">
              <div className="relative w-18 h-18 shrink-0">
                <svg viewBox="0 0 36 36" className="rotate-[-90deg] w-18 h-18">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#9333ea"
                    strokeWidth="3"
                    strokeDasharray={`${brokerPerformance.brokerActivationRate} ${
                      100 - brokerPerformance.brokerActivationRate
                    }`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black text-[var(--brand-700)] tabular-nums">
                    {brokerPerformance.brokerActivationRate}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xl font-black text-[var(--text-primary)] tabular-nums m-0">
                  {brokerPerformance.brokerActivationRate}%
                </p>
                <p className="text-[10px] text-[var(--text-muted)] font-semibold m-0">
                  Active dealmakers in pool
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2 m-0">
              Broker Pipeline Distribution
            </h3>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={brokerPerformance.brokerStatusDist}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={45}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {brokerPerformance.brokerStatusDist.map(
                      (_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0",
                      fontSize: "10px",
                      fontWeight: 700,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs mt-4">
        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 m-0">
          New Broker Onboarding Velocity
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={brokerPerformance.newBrokersOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
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
                dataKey="count"
                name="New Partners Added"
                fill="#9333ea"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
