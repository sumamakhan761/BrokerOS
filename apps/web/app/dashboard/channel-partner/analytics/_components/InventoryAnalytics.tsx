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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { SectionHeader, COLORS } from "./shared";

export function InventoryAnalytics({
  inventoryAnalytics,
}: {
  inventoryAnalytics: any;
}) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Inventory Status & Absorption Rates"
        subtitle="Unit availability, project absorption percentages, and popular unit typologies."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 m-0">
            Inventory Status by Project
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryAnalytics.inventoryPerProject}>
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
                <Bar dataKey="available" name="Available" stackId="a" fill="#10b981" />
                <Bar dataKey="reserved" name="Reserved" stackId="a" fill="#f59e0b" />
                <Bar dataKey="sold" name="Sold" stackId="a" fill="#9333ea" />
                <Bar
                  dataKey="blocked"
                  name="Blocked"
                  stackId="a"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-rows-2 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2 m-0">
              Unit Type Breakdown (Sold)
            </h3>
            {inventoryAnalytics.unitTypeBreakdown.length > 0 ? (
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryAnalytics.unitTypeBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={48}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {inventoryAnalytics.unitTypeBreakdown.map(
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
            ) : (
              <p className="text-xs text-[var(--text-muted)] text-center font-semibold py-6 m-0">
                No sold units yet.
              </p>
            )}
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2 m-0">
              Absorption Rate by Project
            </h3>
            <div className="space-y-2 overflow-y-auto max-h-24 pr-1">
              {inventoryAnalytics.inventoryPerProject.map((p: any) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700 w-28 truncate">
                    {p.name}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                    <div
                      className="h-2 rounded-full bg-[var(--brand-600)] transition-all duration-700"
                      style={{ width: `${p.absorptionRate}%` }}
                    />
                  </div>
                  <span className="text-xs font-extrabold text-[var(--brand-700)] w-10 text-right tabular-nums">
                    {p.absorptionRate}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
