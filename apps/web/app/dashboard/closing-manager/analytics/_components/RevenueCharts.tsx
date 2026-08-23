import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { SectionHeader, COLORS, fmt } from "./shared";

export function RevenueCharts({ charts }: { charts: any }) {
  return (
    <section>
      <SectionHeader title="Revenue & Distribution" subtitle="Revenue breakdown by brokers, projects, and loan statuses." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Broker-wise Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Broker-wise Revenue</h3>
          <div className="h-64 w-full">
            {charts?.brokerWiseRevenue?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.brokerWiseRevenue} dataKey="revenue" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {charts.brokerWiseRevenue.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: any) => fmt(value)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-slate-400 text-center mt-20">No data available</p>}
          </div>
        </div>

        {/* Project-wise Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Project-wise Revenue</h3>
          <div className="h-64 w-full">
            {charts?.projectWiseRevenue?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.projectWiseRevenue} dataKey="revenue" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {charts.projectWiseRevenue.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: any) => fmt(value)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-slate-400 text-center mt-20">No data available</p>}
          </div>
        </div>

        {/* Loan Processing Status */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Loan Processing Status</h3>
          <div className="h-64 w-full">
            {charts?.loanStatusChart?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.loanStatusChart} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {charts.loanStatusChart.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${value} cases`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-slate-400 text-center mt-20">No data available</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
