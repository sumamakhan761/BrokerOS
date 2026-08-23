import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import { SectionHeader } from "./shared";

export function ConversionAnalytics({ conversionRates }: { conversionRates: any }) {
  return (
    <section>
      <SectionHeader title="Conversion Analytics" subtitle="Lead to booking conversion rates per project." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-3xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <TrendingUp className="w-8 h-8 opacity-80 mb-3" />
            <p className="text-sm font-semibold opacity-80">Overall Conversion Rate</p>
            <h2 className="text-5xl font-black mt-1">{conversionRates.overallConversionRate}%</h2>
          </div>
          <p className="text-xs opacity-70 mt-4">Leads → Bookings across all CP projects</p>
        </div>
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Conversion Rate by Project</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={conversionRates.conversionByProject}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="leads" name="Leads" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="bookings" name="Bookings" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
