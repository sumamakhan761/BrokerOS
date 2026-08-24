"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Lock } from "lucide-react";
import { SectionHeader, COLORS, fmt } from "./shared";

export function BrokerageSettlement({
  brokerageSettlement,
}: {
  brokerageSettlement: any;
}) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Brokerage Settlement Status"
        subtitle="Commission payment tracking and settlement reconciliation across CP developments."
      />
      <div className="relative rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden bg-white">
        {brokerageSettlement.comingSoon && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs gap-1.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mb-1 border border-slate-200">
              <Lock size={18} />
            </div>
            <span className="text-sm font-extrabold text-slate-800">
              Automated Bank Settlement Gateway
            </span>
            <p className="text-xs text-[var(--text-muted)] font-medium m-0">
              Real-time NEFT/RTGS direct payout engine under scheduled release.
            </p>
          </div>
        )}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-3">
            <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4">
              <p className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider mb-0.5 m-0">
                Commission Pending Disbursal
              </p>
              <h3 className="text-2xl font-black text-amber-950 tabular-nums m-0">
                {fmt(brokerageSettlement.pendingAmount || 0)}
              </h3>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-4">
              <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider mb-0.5 m-0">
                Commission Settled & Paid
              </p>
              <h3 className="text-2xl font-black text-emerald-950 tabular-nums m-0">
                {fmt(brokerageSettlement.paidAmount || 0)}
              </h3>
            </div>
          </div>
          <div className="lg:col-span-2 h-44 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-1 m-0">
              Settlement Status Breakdown
            </h3>
            {(brokerageSettlement.statusBreakdown?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={brokerageSettlement.statusBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {brokerageSettlement.statusBreakdown.map(
                      (_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0",
                      fontSize: "10px",
                      fontWeight: 700,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-[var(--text-muted)] pt-10 text-center font-semibold m-0">
                No settlement records logged yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
