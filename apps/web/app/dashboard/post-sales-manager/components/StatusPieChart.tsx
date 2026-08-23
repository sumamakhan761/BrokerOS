"use client";

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

export function StatusPieChart({ data, title, description }: StatusPieChartProps) {
  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
        <p className="text-sm font-medium text-slate-400 mb-4">{description}</p>
        <div className="flex-1 flex items-center justify-center text-sm font-medium text-slate-400 bg-slate-50 w-full rounded-xl border border-slate-100 border-dashed">
          No data available for this period.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[350px] flex flex-col p-6 bg-white rounded-2xl border border-slate-100 shadow-sm widget-card">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">{title}</h3>
        {description && <p className="text-[11px] font-medium text-slate-400 mt-1">{description}</p>}
      </div>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              cornerRadius={6}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ fontWeight: 700 }}
              formatter={(value: any) => [value, '']}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              formatter={(value) => <span className="text-xs font-semibold text-slate-600 ml-1">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
