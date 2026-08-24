"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { SectionHeader, fmt } from "./shared";

export function RevenueCharts({ revenueCharts }: { revenueCharts: any }) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Revenue & Contract Analytics"
        subtitle="Contract value vs initial token amounts across developments over time."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 m-0">
            Revenue Velocity Over Time
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueCharts.revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => fmt(v)}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                  formatter={(v: any) => fmt(v)}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Contract Value"
                  stroke="#9333ea"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="tokenRevenue"
                  name="Token Collection"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 m-0">
            Project-wise Revenue Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueCharts.projectWiseRevenue}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => fmt(v)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                  formatter={(v: any) => fmt(v)}
                />
                <Bar
                  dataKey="revenue"
                  name="Contract Revenue"
                  fill="#9333ea"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
