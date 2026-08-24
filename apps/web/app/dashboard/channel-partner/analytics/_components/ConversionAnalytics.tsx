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
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { SectionHeader } from "./shared";

export function ConversionAnalytics({
  conversionRates,
}: {
  conversionRates: any;
}) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Channel Partner Conversion Efficiency"
        subtitle="Lead to booking conversion ratios benchmarked per CP development."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-700 to-indigo-800 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center mb-3 border border-white/20">
              <TrendingUp size={20} className="text-white" />
            </div>
            <p className="text-xs font-bold text-purple-200 uppercase tracking-wider m-0">
              Overall Network Conversion
            </p>
            <h2 className="text-4xl font-black mt-1 tabular-nums tracking-tight m-0">
              {conversionRates.overallConversionRate}%
            </h2>
          </div>
          <p className="text-[11px] text-purple-200/80 font-medium mt-4 m-0">
            Sourced Broker Leads → Confirmed Bookings across all active CP inventory
          </p>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 m-0">
            Conversion Volume by Project (Leads vs Bookings)
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionRates.conversionByProject}>
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
                <Legend
                  wrapperStyle={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                  }}
                />
                <Bar
                  dataKey="leads"
                  name="Leads Sourced"
                  fill="#cbd5e1"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="bookings"
                  name="Bookings"
                  fill="#9333ea"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
