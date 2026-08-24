"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface StatusPieChartProps {
  data: ChartData[];
  title: string;
  description?: string;
}

export function StatusPieChart({
  data,
  title,
  description,
}: StatusPieChartProps) {
  if (!data || data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs">
        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-1">
          {title}
        </h3>
        {description && (
          <p className="text-[11px] font-medium text-[var(--text-muted)] mb-4">
            {description}
          </p>
        )}
        <div className="flex-1 flex items-center justify-center text-xs font-medium text-[var(--text-muted)] bg-slate-50 w-full rounded-2xl border border-slate-200 border-dashed">
          No data available for this period.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[320px] flex flex-col p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs">
      <div className="mb-3">
        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
          {title}
        </h3>
        {description && (
          <p className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5 m-0">
            {description}
          </p>
        )}
      </div>
      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={6}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                fontSize: "11px",
                fontWeight: 700,
              }}
              formatter={(value: any) => [value, ""]}
            />
            <Legend
              verticalAlign="bottom"
              height={32}
              iconType="circle"
              formatter={(value) => (
                <span className="text-xs font-bold text-slate-600 ml-1">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
