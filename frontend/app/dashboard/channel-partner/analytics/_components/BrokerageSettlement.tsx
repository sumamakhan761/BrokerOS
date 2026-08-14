import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Lock } from "lucide-react";
import { SectionHeader, COLORS, fmt } from "./shared";

export function BrokerageSettlement({ brokerageSettlement }: { brokerageSettlement: any }) {
  return (
    <section>
      <SectionHeader title="Brokerage Settlement Status" subtitle="Commission payment tracking across all CP projects." />
      <div className={`relative rounded-3xl border border-slate-200 shadow-sm overflow-hidden`}>
        {brokerageSettlement.comingSoon && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <Lock className="w-10 h-10 text-slate-400 mb-3" />
            <span className="text-xl font-black text-slate-600">Coming Soon</span>
            <p className="text-sm text-slate-400 mt-1">Settlement workflow not yet implemented.</p>
          </div>
        )}
        <div className="bg-white p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex flex-col gap-4">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-amber-700 mb-1">Commission Pending</p>
              <h3 className="text-2xl font-black text-amber-900">{fmt(brokerageSettlement.pendingAmount || 0)}</h3>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-emerald-700 mb-1">Commission Paid</p>
              <h3 className="text-2xl font-black text-emerald-900">{fmt(brokerageSettlement.paidAmount || 0)}</h3>
            </div>
          </div>
          <div className="lg:col-span-2 h-48">
            <h3 className="font-bold text-slate-900 mb-3">Status Breakdown</h3>
            {(brokerageSettlement.statusBreakdown?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={brokerageSettlement.statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={65}>
                    {brokerageSettlement.statusBreakdown.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-slate-400 pt-12 text-center">No records available.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
