import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { authClient } from '../../../lib/auth-client';
import { PostSalesAnalyticsWidgets, PostSalesAnalyticsWidgetsData } from '../../../components/analytics/PostSalesAnalyticsWidgets';
import { PipelinePyramid } from '../../../components/analytics/PipelinePyramid';
import { VelocityGauge } from '../../../components/analytics/VelocityGauge';
import { StatusDistributionBar } from '../../../components/analytics/StatusDistributionBar';
import { InventorySellThroughChart, InventorySellThroughData } from '../../../components/analytics/InventorySellThroughChart';

interface AnalyticsData {
  widgets: PostSalesAnalyticsWidgetsData;
  funnel: {
    booking: number;
    document: number;
    loan: number;
    agreement: number;
    handover: number;
  };
  velocity: number;
  loanSuccessRate: {
    approved: number;
    rejected: number;
    inProgress: number;
  };
  handoverReadiness: {
    notReady: number;
    scheduled: number;
    handedOver: number;
  };
  internalSalesDistribution: { projectName: string; soldUnits: number }[];
  inventorySellThrough: InventorySellThroughData[];
}

const ranges = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
  { id: 'all-time', label: 'All Time' },
];

export default function Analytics() {
  const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('monthly');

  const load = useCallback(async () => {
    try {
      const res = await authClient.$fetch<AnalyticsData>(`/api/dashboard/post-sales/analytics?timeRange=${timeRange}`, { baseURL });
      if (res.data) setData(res.data);
      if (res.error) throw new Error((res.error as any)?.message || 'Failed to load analytics');
    } catch (e: any) {
      setError(e?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [baseURL, timeRange]);

  useEffect(() => {
    setLoading(true);
    // Debounce to prevent concurrent SecureStore access on rapid taps (avoids navigation context errors)
    const timer = setTimeout(() => { load(); }, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading && !refreshing && !data) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="mt-4 text-gray-500 font-medium">Loading analytics...</Text>
      </View>
    );
  }

  if (error && !data) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-6">
        <Text className="text-red-500 font-bold text-lg mb-2">Error loading analytics</Text>
        <Text className="text-red-400 text-center">{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50 p-4"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-4 mt-2">
        <Text className="text-2xl font-black text-gray-900 tracking-tight">Post-Sales Analytics 📊</Text>
        <Text className="text-gray-500 text-sm mt-1">Monitor your team's post-sales performance</Text>
      </View>

      {/* Time Range Segmented Control */}
      <View className="flex-row bg-slate-200 border-0 p-1.5 rounded-full self-start mb-4">
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

      {data && <PostSalesAnalyticsWidgets widgets={data.widgets} />}

      {/* ── Post-Sales Funnel ── */}
      {data && (
        <View className="mt-8 bg-white/95 rounded-2xl p-4 shadow-sm border border-gray-100">
          <Text className="text-base font-bold text-gray-900 uppercase mb-2">Funnel Progression</Text>
          <Text className="text-xs font-medium text-gray-500 mb-4">Pipeline conversion journey</Text>
          <PipelinePyramid
            data={[
              { stage: 'Booking', count: data.funnel.booking, color: '#ec4899' },
              { stage: 'Document', count: data.funnel.document, color: '#d946ef' },
              { stage: 'Loan', count: data.funnel.loan, color: '#a855f7' },
              { stage: 'Agreement', count: data.funnel.agreement, color: '#8b5cf6' },
              { stage: 'Handover', count: data.funnel.handover, color: '#6366f1' },
            ]}
          />
        </View>
      )}

      {/* ── Velocity Gauge ── */}
      {data && (
        <VelocityGauge days={data.velocity} delay={0.3} />
      )}

      {/* ── Status Distributions (Phase 5 & 6) ── */}
      {data && (
        <View className="flex-col w-full">
          <StatusDistributionBar
            title="Loan Approval Success"
            description="Breakdown of loan case statuses"
            delay={0.4}
            data={[
              { name: 'Approved', value: data.loanSuccessRate.approved, color: '#10b981' },
              { name: 'In Progress', value: data.loanSuccessRate.inProgress, color: '#f59e0b' },
              { name: 'Rejected', value: data.loanSuccessRate.rejected, color: '#ef4444' },
            ]}
          />
          <StatusDistributionBar
            title="Handover Readiness"
            description="Status of possession/handover readiness"
            delay={0.5}
            data={[
              { name: 'Not Ready', value: data.handoverReadiness.notReady, color: '#ef4444' },
              { name: 'Scheduled', value: data.handoverReadiness.scheduled, color: '#3b82f6' },
              { name: 'Handed Over', value: data.handoverReadiness.handedOver, color: '#10b981' },
            ]}
          />
        </View>
      )}

      {/* ── Internal Project Analytics ── */}
      {data && (
        <View className="flex-col w-full mt-4">
          <StatusDistributionBar
            title="Internal Sales Distribution"
            description="Percentage share of total sold/reserved units per project"
            delay={0.6}
            data={data.internalSalesDistribution.map((p, index) => {
              const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];
              return { name: p.projectName, value: p.soldUnits, color: colors[index % colors.length] };
            })}
          />
          <InventorySellThroughChart data={data.inventorySellThrough} delay={0.7} />
        </View>
      )}

      <View className="h-10" />
    </ScrollView>
  );
}
