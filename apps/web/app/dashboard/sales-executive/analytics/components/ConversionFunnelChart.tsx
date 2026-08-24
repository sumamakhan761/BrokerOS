"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export function ConversionFunnelChart({ funnelData }: { funnelData: any }) {
  if (!funnelData) return null;

  const data = [
    { name: "Total Leads", value: funnelData.leads || 0, color: "#cbd5e1" },
    { name: "Site Visits", value: funnelData.siteVisits || 0, color: "#a855f7" },
    { name: "Negotiations", value: funnelData.negotiations || 0, color: "#f59e0b" },
    { name: "Reserved", value: funnelData.reserved || 0, color: "#3b82f6" },
    { name: "Sold", value: funnelData.sold || 0, color: "#10b981" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15 }}
      className="bg-white p-6 rounded-3xl shadow-2xs border border-slate-200/80 h-96 flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
            Conversion Funnel
          </h3>
          <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 m-0">
            Stage-wise pipeline conversion
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold text-[var(--brand-700)] tabular-nums leading-none">
            {funnelData.conversionRate || "0.0"}%
          </div>
          <div className="text-[9px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mt-1">
            Conversion Rate
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 30, left: 30, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg border border-slate-700/50">
                      <span className="text-slate-400 mr-1.5">
                        {payload[0].payload.name}:
                      </span>
                      <span className="text-white tabular-nums font-extrabold">
                        {payload[0].value}
                      </span>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
