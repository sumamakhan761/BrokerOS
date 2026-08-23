import React from "react";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { SectionHeader, fmt } from "./shared";

export function RevenueCharts({ revenueCharts }: { revenueCharts: any }) {
  return (
    <section>
      <SectionHeader title="Revenue Analytics" subtitle="Contract value vs token amount across projects and time." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={revenueCharts.revenueOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => fmt(v)} />
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#6366F1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="tokenRevenue" name="Token Amount" stroke="#10B981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Project-wise Revenue</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueCharts.projectWiseRevenue} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => fmt(v)} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Bar dataKey="revenue" name="Revenue" fill="#6366F1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
