import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useLocationTracking } from '../../../hooks/useLocationTracking';
import { authClient } from '../../../lib/auth-client';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DashboardData, LeaderboardEntry } from '../../../components/dashboards/sales-executive/misc/types';
import SalesExecTasks from '../../../components/dashboards/sales-executive/widgets/SalesExecTasks';
import SalesExecLeaderboard from '../../../components/dashboards/sales-executive/widgets/SalesExecLeaderboard';
import LiveTrackingMap from '../../../components/maps/LiveTrackingMap';

export default function SalesExecDashboard() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id || '';
  const userName = session?.user?.name || 'Sales Executive';
  const router = useRouter();

  const { isTracking, toggleTracking, errorMsg } = useLocationTracking(userId);

  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [leaderboard, setLeaderboard] = useState<{ leaderboard: LeaderboardEntry[]; currentUserId: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
      const [dashRes, lbRes] = await Promise.all([
        authClient.$fetch<DashboardData>('/api/dashboard/sales-executive', { baseURL: baseUrl }),
        authClient.$fetch<{ leaderboard: LeaderboardEntry[]; currentUserId: string }>('/api/dashboard/sales-executive/leaderboard', { baseURL: baseUrl }),
      ]);
      if (dashRes.data) setDashData(dashRes.data);
      if (lbRes.data) setLeaderboard(lbRes.data);
      if (dashRes.error) throw new Error(dashRes.error.message);
    } catch (e: any) {
      setError(e?.message || 'Failed to load dashboard');
    }
  };

  useEffect(() => {
    if (userId) {
      loadData().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const widgets = dashData?.widgets;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {userName.split(' ')[0]} 👋</Text>
        <Text style={styles.subtitle}>Here's your sales pipeline & daily tasks.</Text>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* Widgets (Grid) */}
      {widgets && (
        <View className="mb-6 mt-1">
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Overview</Text>
          <View className="flex-row flex-wrap justify-between" style={{ gap: 12 }}>
            {[
              { label: 'Total SVs', value: widgets.siteVisitsScheduled, icon: 'calendar', accent: '#3b82f6', bgClass: 'bg-blue-50', lineClass: 'bg-blue-500' },
              { label: "Today's SVs", value: widgets.todaySiteVisitsDone, icon: 'activity', accent: '#8b5cf6', bgClass: 'bg-violet-50', lineClass: 'bg-violet-500' },
              { label: 'SV Completed', value: widgets.siteVisitsCompleted, icon: 'check-circle', accent: '#10b981', bgClass: 'bg-emerald-50', lineClass: 'bg-emerald-500' },
              { label: 'Negotiations', value: widgets.negotiations, icon: 'message-square', accent: '#f59e0b', bgClass: 'bg-amber-50', lineClass: 'bg-amber-500' },
              { label: 'Bookings', value: widgets.bookingsGenerated, icon: 'award', accent: '#e11d48', bgClass: 'bg-rose-50', lineClass: 'bg-rose-500' },
            ].map((w) => (
              <View key={w.label} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm shadow-slate-200/50" style={{ width: '48%' }}>
                <View className={`w-9 h-9 rounded-xl justify-center items-center mb-3 ${w.bgClass}`}>
                  <Feather name={w.icon as any} size={18} color={w.accent} />
                </View>
                <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">{w.value}</Text>
                <Text className="text-xs font-medium text-slate-500 mt-1">{w.label}</Text>
                <View className={`h-1 rounded-full mt-3 opacity-60 ${w.lineClass}`} />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Navigation Cards */}
      <View style={[styles.card, { padding: 0, overflow: 'hidden', marginBottom: 20 }]}>
        <TouchableOpacity 
          style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}
          onPress={() => router.push('/(dashboard)/sales-executive/approval' as any)}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4', marginBottom: 0 }]}>
            <Feather name="check-circle" size={20} color="#16a34a" />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>My Approvals</Text>
            <Text style={styles.cardSubtitle}>Manage requests with your manager</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#cbd5e1" />
        </TouchableOpacity>
      </View>

      {/* Tasks & Leaderboard */}
      {dashData && <SalesExecTasks dashData={dashData} />}
      <SalesExecLeaderboard leaderboard={leaderboard} />

      {/* Live Location Tracking */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Feather name="map-pin" size={20} color="#2563eb" />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>Live Location Tracking</Text>
            <Text style={styles.cardSubtitle}>Share location with managers</Text>
          </View>
          <Switch
            value={isTracking}
            onValueChange={toggleTracking}
            trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
            thumbColor={isTracking ? '#2563eb' : '#f8fafc'}
          />
        </View>
        {errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : (
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: isTracking ? '#10b981' : '#cbd5e1' }]} />
            <Text style={styles.statusText}>{isTracking ? 'Active & sharing location' : 'Tracking paused'}</Text>
          </View>
        )}

        <LiveTrackingMap />
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorBannerText: {
    color: '#ef4444',
    fontSize: 13,
  },
  widgetsScroll: {
    flexDirection: 'row',
    marginBottom: 24,
    marginHorizontal: -20,
    paddingLeft: 20,
  },
  widgetCard: {
    width: 120,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    alignItems: 'flex-start',
  },
  widgetIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  widgetVal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  widgetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 10,
  },
});

