"use client";

import React from "react";
import { ArrowRight, Star, Trophy } from "lucide-react";
import { SectionHeader, fmt } from "./shared";

export function Insights({ data }: { data: any }) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Conversion Funnel & Channel Partner Podium"
        subtitle="Funnel velocity, highest performing developments, and leaderboard rankings."
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Conversion Funnel */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 m-0">
            Channel Partner Conversion Funnel
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-xs font-bold text-slate-700">
                Leads Sourced
              </span>
              <span className="text-lg font-black text-slate-900 tabular-nums">
                {data.conversionRates?.leads || 0}
              </span>
            </div>
            <div className="flex justify-center -my-1.5 z-10">
              <ArrowRight className="w-4 h-4 text-slate-300 rotate-90" />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-purple-50/70 rounded-2xl border border-purple-100">
              <span className="text-xs font-bold text-[var(--brand-700)]">
                Site Visits Completed
              </span>
              <span className="text-lg font-black text-purple-950 tabular-nums">
                {data.conversionRates?.siteVisits || 0}
              </span>
            </div>
            <div className="flex justify-center -my-1.5 z-10">
              <ArrowRight className="w-4 h-4 text-purple-300 rotate-90" />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100">
              <span className="text-xs font-bold text-emerald-800">
                Final Bookings
              </span>
              <span className="text-lg font-black text-emerald-950 tabular-nums">
                {data.conversionRates?.bookings || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-amber-50/60 border border-amber-200/70 rounded-3xl p-5 shadow-2xs flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center border border-amber-200">
                  <Star size={14} />
                </div>
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider m-0">
                  Most Selling Project
                </h3>
              </div>
              {data.mostSellingProject ? (
                <>
                  <h2 className="text-lg font-extrabold text-amber-950 m-0 mt-1">
                    {data.mostSellingProject.name}
                  </h2>
                  <p className="text-xs font-bold text-amber-800/80 mt-0.5 m-0 tabular-nums">
                    {data.mostSellingProject.unitsSold} units sold
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

          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs flex-1 flex flex-col justify-center items-center text-center">
            <p className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-2 m-0">
              Broker Network Activation Rate
            </p>
            <div className="relative">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-slate-100"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray="188.5"
                  strokeDashoffset={
                    188.5 -
                    (188.5 * (data.brokerActivationRate || 0)) / 100
                  }
                  className="text-[var(--brand-600)] transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-black text-[var(--text-primary)] tabular-nums">
                  {data.brokerActivationRate || 0}%
                </span>
              </div>
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
