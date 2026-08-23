import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { authClient } from '../../../../lib/auth-client';
import { FinancialOverview } from '../../../../app/(dashboard)/sales-executive/analytics/components/FinancialOverview';
import { ConversionFunnel } from '../../../../app/(dashboard)/sales-executive/analytics/components/ConversionFunnel';
import { TowerHeatmap } from '../../../../app/(dashboard)/sales-executive/analytics/components/TowerHeatmap';
import { ProjectAnalytics } from '../../../../app/(dashboard)/sales-executive/analytics/components/ProjectAnalytics';

const ranges = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
  { id: 'all-time', label: 'All Time' },
];

export default function MobileEmployeeAnalytics({ employeeId }: { employeeId: string }) {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('monthly');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authClient.$fetch<any>(`/api/dashboard/sales-manager/employees/${employeeId}/analytics?timeRange=${timeRange}`, { baseURL: baseUrl });
      if (res.data) setAnalyticsData(res.data);
      if (res.error) throw new Error(res.error.message || 'Failed to load analytics');
    } catch (e: any) {
      setError(e?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [employeeId, timeRange, baseUrl]);

  useEffect(() => {
    const timer = setTimeout(() => { load(); }, 300);
    return () => clearTimeout(timer);
  }, [load]);

  if (loading && !analyticsData) {
    return (
      <View className="items-center justify-center py-20">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="text-slate-500 font-medium mt-4">Loading detailed analytics...</Text>
      </View>
    );
  }

  if (error && !analyticsData) {
    return (
      <View className="p-4 justify-center">
        <View className="bg-red-50 p-6 rounded-2xl border border-red-100">
          <Text className="text-red-700 font-medium text-center">{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 pb-8 mt-4 px-4">
      {/* Time Range Segmented Control */}
      <View className="mb-6 items-center">
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
          {analyticsData.financial && <FinancialOverview financialData={analyticsData.financial} />}
          {analyticsData.funnel && <ConversionFunnel funnelData={analyticsData.funnel} />}
          {analyticsData.inventory && <TowerHeatmap inventoryData={analyticsData.inventory} />}
          {analyticsData.project && <ProjectAnalytics projectData={analyticsData.project} />}
        </View>
      )}
    </View>
  );
}
