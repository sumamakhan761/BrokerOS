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

export interface InventorySellThroughData {
  projectName: string;
  totalUnits: number;
  soldUnits: number;
}

interface InventorySellThroughChartProps {
  data: InventorySellThroughData[];
}

export function InventorySellThroughChart({
  data,
}: InventorySellThroughChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full min-h-[340px] flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs">
        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-1">
          Inventory Sell-Through
        </h3>
        <p className="text-[11px] font-medium text-[var(--text-muted)] mb-4">
          Sold vs Available Units
        </p>
        <div className="flex-1 flex items-center justify-center text-xs font-medium text-[var(--text-muted)] bg-slate-50 w-full rounded-2xl border border-slate-200 border-dashed">
          No inventory data available.
        </div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    availableUnits: item.totalUnits - item.soldUnits,
  }));

  return (
    <div className="w-full h-full min-h-[340px] flex flex-col p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs">
      <div className="mb-4">
        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
          Inventory Sell-Through
        </h3>
        <p className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5 m-0">
          Sold vs Available Units across internal projects
        </p>
      </div>
      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#f1f5f9"
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
            />
            <YAxis
              dataKey="projectName"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
              width={90}
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
              dataKey="soldUnits"
              name="Sold / Reserved"
              stackId="a"
              fill="#10b981"
              barSize={24}
            />
            <Bar
              dataKey="availableUnits"
              name="Available"
              stackId="a"
              fill="#e2e8f0"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
