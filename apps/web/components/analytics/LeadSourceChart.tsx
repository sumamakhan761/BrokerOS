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
  Cell,
} from "recharts";
import { PieChart as PieIcon } from "lucide-react";

interface LeadSourceData {
  source: string;
  count: number;
}

interface LeadSourceChartProps {
  data: LeadSourceData[];
}

export function LeadSourceChart({ data }: LeadSourceChartProps) {
  const colors = [
    "#9333ea", // purple 600
    "#6366f1", // indigo 500
    "#3b82f6", // blue 500
    "#06b6d4", // cyan 500
    "#10b981", // emerald 500
    "#f59e0b", // amber 500
    "#f43f5e", // rose 500
    "#8b5cf6", // violet 500
  ];

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[240px] flex flex-col items-center justify-center text-xs font-semibold text-[var(--text-muted)] bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 gap-2">
        <PieIcon size={18} className="text-slate-300" />
        <span>No lead source distribution data for this period.</span>
      </div>
    );
  }

  return (
    <div className="w-full h-[240px] animate-enter">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#f1f5f9"
          />
          <XAxis type="number" hide />
          <YAxis
            dataKey="source"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
            width={100}
          />
          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as LeadSourceData;
                return (
                  <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl space-y-0.5">
                    <p className="font-bold text-slate-200">{item.source}</p>
                    <p className="font-extrabold text-white tabular-nums">
                      {item.count} leads
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
