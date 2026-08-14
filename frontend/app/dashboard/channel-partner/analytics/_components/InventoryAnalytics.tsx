import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { SectionHeader, COLORS } from "./shared";

export function InventoryAnalytics({ inventoryAnalytics }: { inventoryAnalytics: any }) {
  return (
    <section>
      <SectionHeader title="Inventory Analytics" subtitle="Availability, absorption rates, and top selling unit types." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Inventory Status by Project</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={inventoryAnalytics.inventoryPerProject}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="available" name="Available" stackId="a" fill="#10B981" />
              <Bar dataKey="reserved" name="Reserved" stackId="a" fill="#F59E0B" />
              <Bar dataKey="sold" name="Sold" stackId="a" fill="#6366F1" />
              <Bar dataKey="blocked" name="Blocked" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-rows-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-3">Unit Type Breakdown (Sold)</h3>
            {inventoryAnalytics.unitTypeBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={inventoryAnalytics.unitTypeBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={55}>
                    {inventoryAnalytics.unitTypeBreakdown.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-slate-400 text-center pt-8">No sold units yet.</p>}
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-3">Absorption Rate by Project</h3>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-28">
              {inventoryAnalytics.inventoryPerProject.map((p: any) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-28 truncate font-medium">{p.name}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${p.absorptionRate}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-800 w-10 text-right">{p.absorptionRate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
