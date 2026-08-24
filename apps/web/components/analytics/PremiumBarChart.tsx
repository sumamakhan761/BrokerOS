"use client";

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PremiumBarChartProps {
  data: any[];
  title: string;
  description?: string;
  dataKey: string;
  categoryKey?: string;
  color?: string;
}

export default function PremiumBarChart({
  data,
  title,
  description,
  dataKey,
  categoryKey = "name",
  color = "#9333ea",
}: PremiumBarChartProps) {
  const gradientId = `barGradient-${title.replace(/\s/g, "")}`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden p-6 animate-enter">
      <div className="flex flex-col space-y-0.5 mb-4">
        <h3 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight m-0">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-[var(--text-muted)] font-medium m-0">
            {description}
          </p>
        )}
      </div>

      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.85} />
                <stop offset="100%" stopColor={color} stopOpacity={0.25} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey={categoryKey}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
              dy={8}
            />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl shadow-xl text-xs space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {label}
                      </p>
                      <p className="text-sm font-extrabold text-white tabular-nums">
                        {Number(payload[0].value).toLocaleString("en-IN")}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey={dataKey}
              fill={`url(#${gradientId})`}
              radius={[6, 6, 0, 0]}
              barSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
