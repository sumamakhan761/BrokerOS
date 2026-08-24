"use client";

import React from "react";
import {
  ArrowRight,
  Trophy,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Key,
  Home,
} from "lucide-react";
import { SectionHeader, fmt } from "./shared";

export function Insights({ data }: { data: any }) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Pipeline Conversion Funnel & Top Producers"
        subtitle="Closing stage pipeline, top developments, and premier broker performers."
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Cumulative Pipeline Funnel */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-1 m-0">
            Closing Stage Pipeline (Cumulative)
          </h3>
          <p className="text-[11px] font-medium text-[var(--text-muted)] mb-4 m-0">
            Each stage includes units that have progressed to it or beyond.
          </p>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="text-slate-400 w-4 h-4" />
                <span className="text-xs font-bold text-slate-700">
                  Confirmed Bookings
                </span>
              </div>
              <span className="text-base font-black text-slate-900 tabular-nums">
                {data.funnel?.confirmed || 0}
              </span>
            </div>
            <div className="flex justify-center -my-1 z-10">
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 rotate-90" />
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50/70 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-2.5">
                <FileText className="text-blue-500 w-4 h-4" />
                <span className="text-xs font-bold text-blue-700">
                  Documentation & Beyond
                </span>
              </div>
              <span className="text-base font-black text-blue-900 tabular-nums">
                {data.funnel?.documentation || 0}
              </span>
            </div>
            <div className="flex justify-center -my-1 z-10">
              <ArrowRight className="w-3.5 h-3.5 text-blue-300 rotate-90" />
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50/70 rounded-2xl border border-purple-100">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="text-[var(--brand-600)] w-4 h-4" />
                <span className="text-xs font-bold text-[var(--brand-700)]">
                  Loan / Agreement Sanctioned
                </span>
              </div>
              <span className="text-base font-black text-purple-950 tabular-nums">
                {data.funnel?.loanAgreement || 0}
              </span>
            </div>
            <div className="flex justify-center -my-1 z-10">
              <ArrowRight className="w-3.5 h-3.5 text-purple-300 rotate-90" />
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50/70 rounded-2xl border border-amber-100">
              <div className="flex items-center gap-2.5">
                <Key className="text-amber-500 w-4 h-4" />
                <span className="text-xs font-bold text-amber-700">
                  Possession Pending
                </span>
              </div>
              <span className="text-base font-black text-amber-900 tabular-nums">
                {data.funnel?.possession || 0}
              </span>
            </div>
            <div className="flex justify-center -my-1 z-10">
              <ArrowRight className="w-3.5 h-3.5 text-amber-300 rotate-90" />
            </div>

            <div className="flex items-center justify-between p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-2.5">
                <Home className="text-emerald-500 w-4 h-4" />
                <span className="text-xs font-bold text-emerald-700">
                  Handover Completed
                </span>
              </div>
              <span className="text-base font-black text-emerald-900 tabular-nums">
                {data.funnel?.handover || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-amber-50/60 border border-amber-200/70 rounded-3xl p-5 shadow-2xs flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center border border-amber-200">
                  <Trophy size={14} />
                </div>
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider m-0">
                  Top Closing Project
                </h3>
              </div>
              {data.mostSellingProject ? (
                <>
                  <h2 className="text-lg font-extrabold text-amber-950 m-0 mt-1">
                    {data.mostSellingProject.name}
                  </h2>
                  <p className="text-xs font-bold text-amber-800/80 mt-0.5 m-0 tabular-nums">
                    {data.mostSellingProject.unitsSold} units closed
                  </p>
                  <p className="text-xl font-black text-amber-900 mt-2 m-0 tabular-nums">
                    {fmt(data.mostSellingProject.revenue)}
                  </p>
                </>
              ) : (
                <p className="text-xs font-medium text-amber-800 mt-2">
                  No project data available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Top Brokers Leaderboard */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-200/60">
              <Trophy size={14} />
            </div>
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
              Top 5 Brokers
            </h3>
          </div>
          <div className="space-y-2">
            {data.top5Brokers?.map((broker: any) => (
              <div
                key={broker.rank}
                className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-2xl transition-colors border border-slate-100"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[10px] tabular-nums shrink-0 ${
                      broker.rank === 1
                        ? "bg-amber-100 text-amber-800"
                        : broker.rank === 2
                        ? "bg-slate-200 text-slate-700"
                        : broker.rank === 3
                        ? "bg-orange-100 text-orange-800"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    #{broker.rank}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[var(--text-primary)] text-xs truncate m-0">
                      {broker.name}
                    </p>
                    <p className="text-[10px] font-semibold text-[var(--text-muted)] mt-0.5 m-0 tabular-nums">
                      {broker.unitsSold} units
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {(!data.top5Brokers || data.top5Brokers.length === 0) && (
              <div className="py-8 text-center text-xs font-semibold text-[var(--text-muted)]">
                No active brokers
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
