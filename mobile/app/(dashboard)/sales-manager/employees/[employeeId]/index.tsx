import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authClient } from '../../../../../lib/auth-client';
import { DashboardData, LeaderboardEntry } from '../../../../../components/dashboards/sales-executive/misc/types';
import SalesExecTasks from '../../../../../components/dashboards/sales-executive/widgets/SalesExecTasks';
import SalesExecLeaderboard from '../../../../../components/dashboards/sales-executive/widgets/SalesExecLeaderboard';
import LiveTrackingMap from '../../../../../components/maps/LiveTrackingMap';
import MobileEmployeeLeads from '../../../../../components/dashboards/sales-manager/widgets/MobileEmployeeLeads';
import MobileEmployeeAnalytics from '../../../../../components/dashboards/sales-manager/widgets/MobileEmployeeAnalytics';

export default function SalesManagerViewAsEmployee() {
  const router = useRouter();
  const { employeeId } = useLocalSearchParams<{ employeeId: string }>();

  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [leaderboard, setLeaderboard] = useState<{ leaderboard: LeaderboardEntry[]; currentUserId: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'analytics'>('dashboard');

  const loadData = async () => {
    if (!employeeId) return;
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
      const [dashRes] = await Promise.all([
        authClient.$fetch<DashboardData>(`/api/dashboard/sales-manager/employees/${employeeId}/dashboard`, { baseURL: baseUrl }),
      ]);
      if (dashRes.data) setDashData(dashRes.data);
      if (dashRes.error) throw new Error(dashRes.error.message);
    } catch (e: any) {
      setError(e?.message || 'Failed to load dashboard');
    }
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [employeeId]);

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
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* View As Banner */}
      <View style={styles.banner}>
        <Feather name="eye" size={16} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.bannerText}>Viewing Employee Dashboard</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Exit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'leads' && styles.activeTab]}
          onPress={() => setActiveTab('leads')}
        >
          <Text style={[styles.tabText, activeTab === 'leads' && styles.activeTabText]}>Leads</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>Analytics</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        {activeTab === 'dashboard' && (
          <>
            {/* Widgets (Horizontal Scroll) */}
            {widgets && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.widgetsScroll} contentContainerStyle={{ paddingRight: 20 }}>
                <View style={[styles.widgetCard, { backgroundColor: '#eff6ff' }]}>
                  <Text style={styles.widgetIcon}>🗓️</Text>
                  <Text style={styles.widgetVal}>{widgets.siteVisitsScheduled}</Text>
                  <Text style={styles.widgetLabel}>Total SVs</Text>
                </View>
                <View style={[styles.widgetCard, { backgroundColor: '#eef2ff' }]}>
                  <Text style={styles.widgetIcon}>🏃</Text>
                  <Text style={styles.widgetVal}>{widgets.todaySiteVisitsDone}</Text>
                  <Text style={styles.widgetLabel}>Today's SVs Done</Text>
                </View>
                <View style={[styles.widgetCard, { backgroundColor: '#f5f3ff' }]}>
                  <Text style={styles.widgetIcon}>✅</Text>
                  <Text style={styles.widgetVal}>{widgets.siteVisitsCompleted}</Text>
                  <Text style={styles.widgetLabel}>SV Completed</Text>
                </View>
                <View style={[styles.widgetCard, { backgroundColor: '#fffbeb' }]}>
                  <Text style={styles.widgetIcon}>💬</Text>
                  <Text style={styles.widgetVal}>{widgets.negotiations}</Text>
                  <Text style={styles.widgetLabel}>Negotiations</Text>
                </View>
                <View style={[styles.widgetCard, { backgroundColor: '#ecfdf5' }]}>
                  <Text style={styles.widgetIcon}>🎉</Text>
                  <Text style={styles.widgetVal}>{widgets.bookingsGenerated}</Text>
                  <Text style={styles.widgetLabel}>Bookings</Text>
                </View>
              </ScrollView>
            )}

            {/* Tasks */}
            {dashData && <SalesExecTasks dashData={dashData} />}

            {/* Live Location Tracking (View Only) */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Feather name="map-pin" size={20} color="#2563eb" />
                </View>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>Live Location</Text>
                  <Text style={styles.cardSubtitle}>Employee's current location</Text>
                </View>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusBadgeText}>Live</Text>
                </View>
              </View>
              <LiveTrackingMap />
            </View>
          </>
        )}

        {activeTab === 'leads' && employeeId && (
          <MobileEmployeeLeads employeeId={employeeId} />
        )}

        {activeTab === 'analytics' && employeeId && (
          <MobileEmployeeAnalytics employeeId={employeeId} />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#4f46e5',
    padding: 16,
    paddingTop: 48, // Safe area approx
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4f46e5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#4f46e5',
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: 'bold',
  }
});
