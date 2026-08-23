import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { SectionHeader } from "./shared";

export function SMLeaderboard({ smLeaderboard }: { smLeaderboard: any }) {
  return (
    <section>
      <SectionHeader title="Sourcing Manager Leaderboard" subtitle="Compare your SMs — who is performing and who needs attention." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-x-auto">
          <h3 className="font-bold text-slate-900 mb-4">SM Performance Table</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 text-slate-500 font-semibold text-xs">SM Name</th>
                <th className="text-right py-2 text-slate-500 font-semibold text-xs">Active</th>
                <th className="text-right py-2 text-slate-500 font-semibold text-xs">New</th>
                <th className="text-right py-2 text-slate-500 font-semibold text-xs">Meetings</th>
                <th className="text-right py-2 text-slate-500 font-semibold text-xs">Bookings</th>
              </tr>
            </thead>
            <tbody>
              {[...smLeaderboard.table].sort((a: any, b: any) => b.bookingsVia - a.bookingsVia).map((sm: any) => (
                <tr key={sm.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 font-semibold text-slate-800">{sm.name}</td>
                  <td className="py-2.5 text-right text-emerald-700 font-bold">{sm.activeBrokers}</td>
                  <td className="py-2.5 text-right text-sky-600 font-bold">{sm.newBrokers}</td>
                  <td className="py-2.5 text-right text-slate-600">{sm.meetings}</td>
                  <td className="py-2.5 text-right text-indigo-700 font-black">{sm.bookingsVia}</td>
                </tr>
              ))}
              {smLeaderboard.table.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-slate-400 text-sm">No sourcing managers yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">SM Contribution (Bookings via Brokers)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={smLeaderboard.contributionChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="bookings" name="Bookings" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
