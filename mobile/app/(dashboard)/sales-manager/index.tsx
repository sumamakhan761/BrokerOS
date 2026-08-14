import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { authClient } from '../../../lib/auth-client';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SalesManagerTasks from '../../../components/dashboards/sales-manager/widgets/SalesManagerTasks';
import SalesManagerLeaderboard from '../../../components/dashboards/sales-manager/widgets/SalesManagerLeaderboard';

export default function SalesManagerDashboard() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id || '';
  const userName = session?.user?.name || 'Sales Manager';
  const router = useRouter();

  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
      const res = await authClient.$fetch<any>('/api/dashboard/sales-manager', { baseURL: baseUrl });
      
      if (res.data) setDashData(res.data);
      if (res.error) throw new Error(res.error.message);
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
        <Text style={styles.subtitle}>Here is your team's performance overview.</Text>
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
              { label: 'SVs Scheduled', value: widgets.siteVisitsScheduled, icon: 'calendar', accent: '#3b82f6', bgClass: 'bg-blue-50', lineClass: 'bg-blue-500' },
              { label: 'SVs Completed', value: widgets.siteVisitsCompleted, icon: 'check-circle', accent: '#10b981', bgClass: 'bg-emerald-50', lineClass: 'bg-emerald-500' },
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
      <View style={styles.navGrid}>
        <TouchableOpacity 
          style={styles.navCard}
          onPress={() => router.push('/(dashboard)/sales-manager/lead-management' as any)}
        >
          <View style={[styles.navIconBox, { backgroundColor: '#f0f9ff' }]}>
            <Feather name="users" size={24} color="#0284c7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.navTitle}>Lead Management</Text>
            <Text style={styles.navSubtitle}>View and reassign team leads</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navCard, { marginTop: 12 }]}
          onPress={() => router.push('/(dashboard)/sales-manager/approval' as any)}
        >
          <View style={[styles.navIconBox, { backgroundColor: '#f0fdf4' }]}>
            <Feather name="check-circle" size={24} color="#16a34a" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.navTitle}>Team Approvals</Text>
            <Text style={styles.navSubtitle}>Review and manage requests</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Team Tasks & Leaderboard */}
      {dashData && <SalesManagerTasks dashData={dashData} />}
      {dashData && <SalesManagerLeaderboard leaderboardData={dashData.teamLeaderboard} />}
      
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
    marginBottom: 20,
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
  navGrid: {
    marginBottom: 24,
  },
  navCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  navIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  navSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
});
