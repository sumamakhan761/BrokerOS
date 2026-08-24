"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface ProjectPerformanceData {
  projectName: string;
  activePostSales: number;
  handovers: number;
}

interface ProjectPerformanceChartProps {
  data: ProjectPerformanceData[];
}

export function ProjectPerformanceChart({
  data,
}: ProjectPerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full min-h-[340px] flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs">
        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-1">
          Project Performance
        </h3>
        <p className="text-[11px] font-medium text-[var(--text-muted)] mb-4">
          Post-sales vs Handovers per project
        </p>
        <div className="flex-1 flex items-center justify-center text-xs font-medium text-[var(--text-muted)] bg-slate-50 w-full rounded-2xl border border-slate-200 border-dashed">
          No project data available.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[340px] flex flex-col p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs">
      <div className="mb-4">
        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
          Project Performance
        </h3>
        <p className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5 m-0">
          Active Post-Sales vs Completed Handovers across all projects
        </p>
      </div>
      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="projectName"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
            />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                fontSize: "11px",
                fontWeight: 700,
              }}
            />
            <Legend
              verticalAlign="top"
              height={32}
              iconType="circle"
              wrapperStyle={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#64748b",
              }}
            />
            <Bar
              dataKey="activePostSales"
              name="Active Post-Sales"
              stackId="a"
              fill="#9333ea"
              barSize={28}
            />
            <Bar
              dataKey="handovers"
              name="Handovers"
              stackId="a"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
