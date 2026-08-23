import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Target,
  CheckCircle,
  Clock,
  FileText,
  Banknote,
  DollarSign,
  PieChart,
  CheckSquare,
  TrendingUp
} from 'lucide-react-native';

export function DetailedMetricsGrid({ metrics }: { metrics: any }) {
  const defaultMetrics = {
    salesFunnel: { assignedCustomers: 0, siteVisitsScheduled: 0, siteVisitsCompleted: 0, negotiations: 0, confirmedBookings: 0, conversionRate: "0.0" },
    teamAnalytics: { followUpsCompleted: 0, pendingSiteVisits: 0 },
    revenueAnalytics: { daily: 0, weekly: 0, monthly: 0, quarterly: 0, averageBookingValue: 0, trend: [] }
  };

  const { salesFunnel, teamAnalytics, revenueAnalytics } = metrics || defaultMetrics;

  return (
    <View className="mb-6">
      {/* Sales Funnel Analytics */}
      <View className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <View className="flex-row items-center gap-2 mb-6">
          <PieChart size={20} color="#6366f1" />
          <Text className="text-lg font-bold text-slate-800">Sales Funnel Analytics</Text>
        </View>
        <View className="gap-2">
          <MetricRow icon={<Target size={16} color="#6366f1" />} label="Assigned Customers" value={salesFunnel?.assignedCustomers || 0} />
          <MetricRow icon={<Clock size={16} color="#f59e0b" />} label="Site Visits Scheduled" value={salesFunnel?.siteVisitsScheduled || 0} />
          <MetricRow icon={<CheckCircle size={16} color="#10b981" />} label="Site Visits Completed" value={salesFunnel?.siteVisitsCompleted || 0} />
          <MetricRow icon={<FileText size={16} color="#3b82f6" />} label="Negotiations" value={salesFunnel?.negotiations || 0} />
          <MetricRow icon={<CheckSquare size={16} color="#a855f7" />} label="Follow-ups Completed" value={teamAnalytics?.followUpsCompleted || 0} />
          <MetricRow icon={<Banknote size={16} color="#059669" />} label="Confirmed Bookings" value={salesFunnel?.confirmedBookings || 0} />

          <View className="pt-4 border-t border-slate-100 mt-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-slate-600">Booking Conversion Rate</Text>
              <Text className="text-lg font-bold text-slate-800">{salesFunnel?.conversionRate || 0}%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Revenue Analytics */}
      <View className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <View className="flex-row items-center gap-2 mb-6">
          <DollarSign size={20} color="#f59e0b" />
          <Text className="text-lg font-bold text-slate-800">Revenue Analytics</Text>
        </View>

        <View className="flex-row flex-wrap gap-4 mb-6">
          <View className="w-[47%]">
            <RevenueCard label="Daily Revenue" value={revenueAnalytics?.daily || 0} />
          </View>
          <View className="w-[47%]">
            <RevenueCard label="Weekly Revenue" value={revenueAnalytics?.weekly || 0} />
          </View>
          <View className="w-[47%]">
            <RevenueCard label="Monthly Revenue" value={revenueAnalytics?.monthly || 0} />
          </View>
          <View className="w-[47%]">
            <RevenueCard label="Quarterly Revenue" value={revenueAnalytics?.quarterly || 0} />
          </View>
        </View>

        <View className="flex-row items-center justify-between p-3 bg-slate-50 rounded-xl mb-4 border border-slate-100">
          <Text className="text-xs font-medium text-slate-600 uppercase">Avg Booking Value</Text>
          <Text className="text-sm font-bold text-slate-800">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(revenueAnalytics?.averageBookingValue || 0)}
          </Text>
        </View>

        <View className="mt-4">
          <Text className="text-xs font-medium text-slate-500 uppercase mb-2">Revenue Trend (Last 7 Days)</Text>
          {revenueAnalytics?.trend?.length > 0 ? (
            <View className="h-24 flex-row items-end justify-between bg-slate-50 rounded-xl p-3 border border-slate-100 gap-1">
              {revenueAnalytics.trend.map((point: any, index: number) => {
                const max = Math.max(...revenueAnalytics.trend.map((p: any) => p.value)) || 1;
                const heightPercent = Math.max((point.value / max) * 100, 10);
                return (
                  <View key={index} className="flex-1 items-center justify-end h-full">
                    <View
                      className="w-full bg-emerald-400 rounded-t-sm"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="h-24 bg-slate-50 rounded-xl border border-slate-100 items-center justify-center">
              <TrendingUp size={24} color="#94a3b8" />
              <Text className="text-xs text-slate-500 mt-2">No trend data available</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function MetricRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <View className="flex-row items-center justify-between p-3 rounded-xl hover:bg-slate-50">
      <View className="flex-row items-center gap-3">
        <View className="p-2 bg-slate-50 rounded-lg border border-slate-100">
          {icon}
        </View>
        <Text className="text-sm font-medium text-slate-700">{label}</Text>
      </View>
      <View className="bg-slate-100 px-3 py-1 rounded-full">
        <Text className="text-sm font-bold text-slate-900">{value.toLocaleString()}</Text>
      </View>
    </View>
  );
}

function RevenueCard({ label, value }: { label: string, value: number }) {
  const formattedValue = value >= 10000000
    ? `₹${(value / 10000000).toFixed(2)} Cr`
    : value >= 100000
      ? `₹${(value / 100000).toFixed(2)} L`
      : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  return (
    <View className="p-4 bg-slate-50 rounded-xl border border-slate-100 justify-center">
      <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1" numberOfLines={1}>{label}</Text>
      <Text className="text-lg font-bold text-slate-800" numberOfLines={1}>{formattedValue}</Text>
    </View>
  );
}
