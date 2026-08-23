import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LineChart, Line } from "recharts";
import { BarChart2, CheckCircle2, Trophy, ArrowRight } from "lucide-react";
import { SectionHeader, COLORS } from "./shared";

export function SiteVisitAnalytics({ siteVisitAnalytics }: { siteVisitAnalytics: any }) {
  return (
    <section>
      <SectionHeader title="Site Visit Analytics" subtitle="Track visit progress and interest quality from broker-led leads." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Visit Progress</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: "Total Scheduled", value: siteVisitAnalytics.svScheduled, icon: <BarChart2 className="text-slate-500 w-5 h-5" />, bg: "bg-slate-50 border-slate-100" },
              { label: "Arrived at Site", value: siteVisitAnalytics.svArrived, icon: <CheckCircle2 className="text-blue-500 w-5 h-5" />, bg: "bg-blue-50 border-blue-100" },
              { label: "Completed", value: siteVisitAnalytics.svCompleted, icon: <Trophy className="text-emerald-500 w-5 h-5" />, bg: "bg-emerald-50 border-emerald-100" },
            ].map((row, i, arr) => (
              <div key={row.label}>
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${row.bg}`}>
                  <div className="flex items-center gap-3">{row.icon}<span className="font-semibold text-slate-700">{row.label}</span></div>
                  <span className="text-xl font-black text-slate-900">{row.value}</span>
                </div>
                {i < arr.length - 1 && <div className="flex justify-center my-1"><ArrowRight className="w-4 h-4 text-slate-300 rotate-90" /></div>}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex-1">
            <h3 className="font-bold text-slate-900 mb-4">Interest Level After Visit</h3>
            {(siteVisitAnalytics.interestLevelBreakdown?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={siteVisitAnalytics.interestLevelBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                    {siteVisitAnalytics.interestLevelBreakdown.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-slate-400 text-center pt-8">No completed visits with interest data yet.</p>}
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex-1">
            <h3 className="font-bold text-slate-900 mb-4">Site Visits Over Time</h3>
            <ResponsiveContainer width="100%" height={130}>
              <LineChart data={siteVisitAnalytics.siteVisitsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" name="Site Visits" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
