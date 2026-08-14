import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { SectionHeader, COLORS } from "./shared";

export function BrokerPerformance({ brokerPerformance }: { brokerPerformance: any }) {
  return (
    <section>
      <SectionHeader title="Broker Performance" subtitle="Top brokers, activation rates, and pipeline health." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Top 10 Brokers by Bookings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-slate-500 font-semibold text-xs">#</th>
                  <th className="text-left py-2 text-slate-500 font-semibold text-xs">Broker</th>
                  <th className="text-left py-2 text-slate-500 font-semibold text-xs">SM</th>
                  <th className="text-right py-2 text-slate-500 font-semibold text-xs">Bookings</th>
                  <th className="text-right py-2 text-slate-500 font-semibold text-xs">Units Sold</th>
                </tr>
              </thead>
              <tbody>
                {brokerPerformance.topBrokers.map((b: any) => (
                  <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 text-xs font-bold text-slate-400">#{b.rank}</td>
                    <td className="py-2.5 font-semibold text-slate-800">{b.name}</td>
                    <td className="py-2.5 text-xs text-slate-500">{b.smName}</td>
                    <td className="py-2.5 text-right font-bold text-indigo-700">{b.bookings}</td>
                    <td className="py-2.5 text-right font-bold text-emerald-700">{b.unitsSold}</td>
                  </tr>
                ))}
                {brokerPerformance.topBrokers.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-400 text-sm">No broker booking data yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-1">Activation Rate</h3>
            <p className="text-xs text-slate-500 mb-4">Brokers who closed at least 1 booking</p>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="rotate-[-90deg] w-20 h-20">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6366F1" strokeWidth="3"
                    strokeDasharray={`${brokerPerformance.brokerActivationRate} ${100 - brokerPerformance.brokerActivationRate}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-black text-indigo-700">{brokerPerformance.brokerActivationRate}%</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{brokerPerformance.brokerActivationRate}%</p>
                <p className="text-xs text-slate-500">of all brokers active</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex-1">
            <h3 className="font-bold text-slate-900 mb-4">Broker Pipeline Health</h3>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={brokerPerformance.brokerStatusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={32} outerRadius={50}>
                  {brokerPerformance.brokerStatusDist.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mt-6">
        <h3 className="font-bold text-slate-900 mb-4">New Brokers Added Over Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={brokerPerformance.newBrokersOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" name="New Brokers" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
