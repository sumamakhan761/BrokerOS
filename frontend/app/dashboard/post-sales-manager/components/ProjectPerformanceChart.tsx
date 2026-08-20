"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export interface ProjectPerformanceData {
  projectName: string;
  activePostSales: number;
  handovers: number;
}

interface ProjectPerformanceChartProps {
  data: ProjectPerformanceData[];
}

export function ProjectPerformanceChart({ data }: ProjectPerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full min-h-[350px] flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-1">Project Performance</h3>
        <p className="text-sm font-medium text-slate-400 mb-4">Post-sales vs Handovers per project</p>
        <div className="flex-1 flex items-center justify-center text-sm font-medium text-slate-400 bg-slate-50 w-full rounded-xl border border-slate-100 border-dashed">
          No project data available.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[350px] flex flex-col p-6 bg-white rounded-2xl border border-slate-100 shadow-sm widget-card">
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">Project Performance</h3>
        <p className="text-[11px] font-medium text-slate-400 mt-1">Active Post-Sales vs Completed Handovers across all projects</p>
      </div>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="projectName" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
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
            <Bar dataKey="activePostSales" name="Active Post-Sales" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} barSize={40} />
            <Bar dataKey="handovers" name="Handovers" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
