"use client";

import React from "react";
import {
  Target,
  CheckCircle,
  Clock,
  FileText,
  Banknote,
  IndianRupee,
  PieChart,
  CheckSquare,
} from "lucide-react";
import {
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function DetailedMetricsGrid({ metrics }: { metrics: any }) {
  if (!metrics) return null;

  const { salesFunnel, teamAnalytics, revenueAnalytics } = metrics;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
      {/* Sales Funnel Analytics */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <PieChart size={15} />
            </div>
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
              Sales Pipeline Throughput
            </h3>
          </div>
          <div className="space-y-2.5">
            <MetricRow
              icon={<Target size={14} className="text-purple-600" />}
              label="Assigned Customers"
              value={salesFunnel.assignedCustomers}
            />
            <MetricRow
              icon={<Clock size={14} className="text-amber-600" />}
              label="Site Visits Scheduled"
              value={salesFunnel.siteVisitsScheduled}
            />
            <MetricRow
              icon={<CheckCircle size={14} className="text-emerald-600" />}
              label="Site Visits Completed"
              value={salesFunnel.siteVisitsCompleted}
            />
            <MetricRow
              icon={<FileText size={14} className="text-blue-600" />}
              label="Negotiations"
              value={salesFunnel.negotiations}
            />
            <MetricRow
              icon={<CheckSquare size={14} className="text-indigo-600" />}
              label="Follow-ups Done"
              value={teamAnalytics.followUpsCompleted}
            />
            <MetricRow
              icon={<Banknote size={14} className="text-emerald-700" />}
              label="Confirmed Bookings"
              value={salesFunnel.confirmedBookings}
            />
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--text-muted)]">
            Booking Win Rate
          </span>
          <span className="text-base font-extrabold text-emerald-700 tabular-nums">
            {salesFunnel.conversionRate}%
          </span>
        </div>
      </div>

      {/* Revenue Analytics */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs flex flex-col justify-between lg:col-span-2 space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <IndianRupee size={15} />
            </div>
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
              Revenue Analytics & Projections
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <RevenueCard label="Daily Revenue" value={revenueAnalytics.daily} />
            <RevenueCard label="Weekly Revenue" value={revenueAnalytics.weekly} />
            <RevenueCard
              label="Monthly Revenue"
              value={revenueAnalytics.monthly}
            />
            <RevenueCard
              label="Quarterly Revenue"
              value={revenueAnalytics.quarterly}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-purple-50/50 rounded-2xl border border-purple-100">
            <span className="text-[10px] font-extrabold text-[var(--brand-700)] uppercase tracking-wider">
              Avg Deal Value
            </span>
            <span className="text-xs font-extrabold text-purple-950 tabular-nums">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(revenueAnalytics.averageBookingValue)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
            Revenue Velocity (Last 7 Days)
          </span>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueAnalytics.trend}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  formatter={(value: any) =>
                    new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(value)
                  }
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#9333ea"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTrend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-2">
        <div className="p-1 rounded-lg bg-slate-100">{icon}</div>
        <span className="text-xs font-semibold text-slate-700">{label}</span>
      </div>
      <span className="text-xs font-extrabold text-[var(--text-primary)] tabular-nums bg-slate-100 px-2 py-0.5 rounded-full">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

function RevenueCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-2xl flex flex-col justify-center">
      <span className="text-[9px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
        {label}
      </span>
      <span className="text-sm font-extrabold text-[var(--text-primary)] tabular-nums truncate">
        {value >= 10000000
          ? `₹${(value / 10000000).toFixed(2)} Cr`
          : value >= 100000
          ? `₹${(value / 100000).toFixed(2)} L`
          : new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(value)}
      </span>
    </div>
  );
}
