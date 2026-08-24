import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CalendarCheck, Footprints, CheckCircle2, MessageSquare, Award } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authClient } from '../../../../../lib/auth-client';
import { DashboardData, LeaderboardEntry } from '../../../../../components/dashboards/sales-executive/misc/types';
import SalesExecTasks from '../../../../../components/dashboards/sales-executive/widgets/SalesExecTasks';
import LiveTrackingMap from '../../../../../components/maps/LiveTrackingMap';
import MobileEmployeeLeads from '../../../../../components/dashboards/sales-manager/widgets/MobileEmployeeLeads';
import MobileEmployeeAnalytics from '../../../../../components/dashboards/sales-manager/widgets/MobileEmployeeAnalytics';
import { SharedWidgetsGrid } from '../../../../../components/shared/SharedWidgetsGrid';

export default function SalesManagerViewAsEmployee() {
  const router = useRouter();
  const { employeeId: _employeeId } = useLocalSearchParams();
  const employeeId = (Array.isArray(_employeeId) ? _employeeId[0] : _employeeId) as string;

  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [leaderboard, setLeaderboard] = useState<{ leaderboard: LeaderboardEntry[]; currentUserId: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'analytics'>('dashboard');

  const loadData = useCallback(async () => {
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
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [employeeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const widgets = dashData?.widgets;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View style={{ padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
        <TouchableOpacity onPress={() => router.navigate('/(dashboard)/sales-manager/employees')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Feather name="arrow-left" size={16} color="#64748b" />
          <Text style={{ color: '#64748b', fontWeight: 'bold', marginLeft: 4 }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0f172a' }}>Viewing Employee</Text>
        <Text style={{ color: '#64748b', fontSize: 13 }}>Full access mode</Text>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
        {['dashboard', 'leads', 'analytics'].map(t => (
          <TouchableOpacity
            key={t}
            style={{ flex: 1, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: activeTab === t ? '#6366f1' : 'transparent' }}
            onPress={() => setActiveTab(t as any)}
          >
            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: activeTab === t ? '#6366f1' : '#64748b', textTransform: 'capitalize' }}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'leads' && employeeId ? (
        <MobileEmployeeLeads employeeId={employeeId} />
      ) : activeTab === 'analytics' && employeeId ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <MobileEmployeeAnalytics employeeId={employeeId} />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {error && (
            <View style={{ backgroundColor: '#fef2f2', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#fecaca' }}>
              <Text style={{ color: '#ef4444', fontSize: 13 }}>{error}</Text>
            </View>
          )}

          {widgets && (
            <SharedWidgetsGrid
              widgets={[
                { label: "Total SVs", value: widgets.siteVisitsScheduled, icon: CalendarCheck, accent: "indigo" },
                { label: "Today's SVs", value: widgets.todaySiteVisitsDone, icon: Footprints, accent: "emerald" },
                { label: "Completed SVs", value: widgets.siteVisitsCompleted, icon: CheckCircle2, accent: "teal" },
                { label: "Negotiations", value: widgets.negotiations, icon: MessageSquare, accent: "amber" },
                { label: "Bookings", value: widgets.bookingsGenerated, icon: Award, accent: "blue" },
              ]}
            />
          )}

          {dashData && (
            <View style={{ marginBottom: 20 }}>
              <SalesExecTasks dashData={dashData} />
            </View>
          )}

          {/* Live Location Tracking (View Only) */}
          <View style={[styles.card, { padding: 20, marginBottom: 20 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a' }}>Live Location</Text>
              <View style={{ backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginRight: 4 }} />
                <Text style={{ fontSize: 11, color: '#059669', fontWeight: 'bold' }}>Live</Text>
              </View>
            </View>
            <View style={{ borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0' }}>
              <LiveTrackingMap />
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
});
