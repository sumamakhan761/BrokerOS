"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export interface InventorySellThroughData {
  projectName: string;
  totalUnits: number;
  soldUnits: number;
}

interface InventorySellThroughChartProps {
  data: InventorySellThroughData[];
}

export function InventorySellThroughChart({ data }: InventorySellThroughChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full min-h-[350px] flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-1">Inventory Sell-Through</h3>
        <p className="text-sm font-medium text-slate-400 mb-4">Sold vs Available Units</p>
        <div className="flex-1 flex items-center justify-center text-sm font-medium text-slate-400 bg-slate-50 w-full rounded-xl border border-slate-100 border-dashed">
          No inventory data available.
        </div>
      </div>
    );
  }

  // Calculate available units for the chart
  const chartData = data.map(item => ({
    ...item,
    availableUnits: item.totalUnits - item.soldUnits,
  }));

  return (
    <div className="w-full h-full min-h-[350px] flex flex-col p-6 bg-white rounded-2xl border border-slate-100 shadow-sm widget-card">
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">Inventory Sell-Through</h3>
        <p className="text-[11px] font-medium text-slate-400 mt-1">Sold vs Available Units across internal projects</p>
      </div>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis 
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
            />
            <YAxis 
              dataKey="projectName" 
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              width={100}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ fontWeight: 700 }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}
            />
            <Bar dataKey="soldUnits" name="Sold/Reserved" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={32} />
            <Bar dataKey="availableUnits" name="Available" stackId="a" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
