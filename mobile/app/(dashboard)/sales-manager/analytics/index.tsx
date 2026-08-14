import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { authClient } from '@/lib/auth-client';
import { FinancialOverview } from '../../sales-executive/analytics/components/FinancialOverview';
import { ConversionFunnel } from '../../sales-executive/analytics/components/ConversionFunnel';
import { TowerHeatmap } from '../../sales-executive/analytics/components/TowerHeatmap';
import SalesManagerLeaderboard from '@/components/dashboards/sales-manager/widgets/SalesManagerLeaderboard';
import { DetailedMetricsGrid } from './components/DetailedMetricsGrid';
import { Users } from 'lucide-react-native';

const ranges = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
  { id: 'all-time', label: 'All Time' },
];

export default function SalesManagerAnalyticsScreen() {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('monthly');

  const load = useCallback(async () => {
    try {
      const res = await authClient.$fetch<any>(`/api/dashboard/sales-manager/analytics?timeRange=${timeRange}`, { baseURL: baseUrl });
      if (res.data) setAnalyticsData(res.data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load team analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [baseUrl, timeRange]);

  useEffect(() => {
    setLoading(true);
    // Debounce to prevent concurrent SecureStore access on rapid taps (avoids navigation context errors)
    const timer = setTimeout(() => { load(); }, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading && !refreshing && !analyticsData) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8fafc]">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-slate-500 font-medium mt-4">Loading team analytics...</Text>
      </View>
    );
  }

  if (error && !analyticsData) {
    return (
      <View className="flex-1 p-6 bg-[#f8fafc] justify-center">
        <View className="bg-red-50 p-6 rounded-2xl border border-red-100">
          <Text className="text-red-700 font-medium text-center">{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#f8fafc]"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
    >
      {/* Header */}
      <View className="px-6 pt-8 pb-4">
        <View className="flex-row items-center gap-3 mb-2">
          <View className="w-10 h-10 bg-emerald-100 rounded-xl items-center justify-center">
            <Users size={20} color="#10b981" />
          </View>
          <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">Team Analytics</Text>
        </View>
        <Text className="text-sm font-medium text-slate-500">
          Track your team's aggregate revenue, pipeline conversion, and project inventory velocity.
        </Text>
      </View>

      {/* Time Range Segmented Control */}
      <View className="px-6 mb-4">
        <View className="flex-row bg-slate-200 border-0 p-1.5 rounded-full self-start">
          {ranges.map(r => (
            <TouchableOpacity
              key={r.id}
              onPress={() => setTimeRange(r.id)}
            >
              <View 
                key={timeRange === r.id ? 'active' : 'inactive'}
                className={`px-4 py-1.5 rounded-full ${timeRange === r.id ? 'bg-white shadow-sm' : ''}`}
              >
                <Text className={`text-sm font-bold ${timeRange === r.id ? 'text-slate-900' : 'text-slate-500'}`}>
                  {r.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {analyticsData && (
        <View className="pb-12">
          <FinancialOverview financialData={analyticsData.financial} />

          <View className="mt-6 mb-6 px-6">
            <DetailedMetricsGrid metrics={analyticsData.detailedMetrics} />
          </View>

          <ConversionFunnel funnelData={analyticsData.funnel} />

          <View className="mt-6 mb-6 px-6">
            <SalesManagerLeaderboard leaderboardData={analyticsData.leaderboard || []} />
          </View>

          <View className="mt-6">
            <TowerHeatmap inventoryData={analyticsData.inventory} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}
