"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { SectionHeader, COLORS, fmt } from "./shared";

export function RevenueCharts({ charts }: { charts: any }) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Revenue & Inventory Distribution"
        subtitle="Revenue breakdown segmented by individual brokers and CP projects."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Broker-wise Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2 m-0">
            Broker-wise Revenue
          </h3>
          <div className="h-64 w-full">
            {charts?.brokerWiseRevenue?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.brokerWiseRevenue}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={4}
                    stroke="none"
                    cornerRadius={4}
                  >
                    {charts.brokerWiseRevenue.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                    formatter={(value: any) => fmt(value)}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs font-semibold text-[var(--text-muted)]">
                No broker data available
              </div>
            )}
          </div>
        </div>

        {/* Project-wise Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2 m-0">
            Project-wise Revenue
          </h3>
          <div className="h-64 w-full">
            {charts?.projectWiseRevenue?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.projectWiseRevenue}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={4}
                    stroke="none"
                    cornerRadius={4}
                  >
                    {charts.projectWiseRevenue.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                    formatter={(value: any) => fmt(value)}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs font-semibold text-[var(--text-muted)]">
                No project data available
              </div>
            )}
          </div>
        </div>

        {/* Project-wise Bookings */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2 m-0">
            Project-wise Bookings
          </h3>
          <div className="h-64 w-full">
            {charts?.projectWiseBookings?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.projectWiseBookings}
                    dataKey="units"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={4}
                    stroke="none"
                    cornerRadius={4}
                  >
                    {charts.projectWiseBookings.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                    formatter={(value: any) => `${value} units`}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs font-semibold text-[var(--text-muted)]">
                No booking data available
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
