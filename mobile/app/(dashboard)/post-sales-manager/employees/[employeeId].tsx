import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, RefreshControl,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { authClient } from '../../../../lib/auth-client';
import { PostSalesDashboardData } from '../../../../components/dashboards/post-sales/misc/types';
import { SharedWidgetsGrid } from '../../../../components/shared/SharedWidgetsGrid';
import PendingListWidget from '../../../../components/dashboards/post-sales/widgets/PendingListWidget';
import PostSalesFollowUps from '../../../../components/dashboards/post-sales/widgets/PostSalesFollowUps';
import { Users, FileText, CircleDollarSign, Edit, Key, CheckCircle } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

type Tab = 'dashboard' | 'leads' | 'analytics';

export default function PostSalesManagerViewAsEmployee() {
  const { employeeId } = useLocalSearchParams<{ employeeId: string }>();
  const router = useRouter();
  const baseURL = process.env.EXPO_PUBLIC_API_URL as string;

  const [dashData, setDashData] = useState<PostSalesDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const fetchData = async () => {
    try {
      const res = await authClient.$fetch<PostSalesDashboardData>(
        `/api/dashboard/post-sales-manager/employees/${employeeId}/dashboard`,
        { baseURL }
      );
      if (res.data) setDashData(res.data);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load employee dashboard' });
    }
  };

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [employeeId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, [employeeId]);

  const confirmFollowUp = async (followUpId: string) => {
    try {
      const res = await authClient.$fetch<{ success: boolean; message: string }>(
        `/api/dashboard/pre-sales/follow-ups/${followUpId}/confirm`,
        { method: 'POST', baseURL }
      );
      if (res.data?.success) {
        Toast.show({ type: 'success', text1: 'Success', text2: 'Follow-up confirmed.' });
        fetchData();
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: res.data?.message || 'Failed.' });
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e?.message || 'Failed.' });
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ marginTop: 12, color: '#64748b' }}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Banner */}
      <View style={{ padding: 16, backgroundColor: '#4f46e5', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>👀 Viewing Employee</Text>
          <Text style={{ fontSize: 12, color: '#e0e7ff', marginTop: 2 }}>Post-Sales Pipeline</Text>
        </View>
        <TouchableOpacity
          style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={16} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 4 }}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
        {(['dashboard', 'leads', 'analytics'] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={{ flex: 1, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: activeTab === tab ? '#6366f1' : 'transparent' }}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: activeTab === tab ? '#6366f1' : '#64748b', textTransform: 'capitalize', fontSize: 13 }}>
              {tab === 'dashboard' ? 'Overview' : tab === 'leads' ? 'Leads' : 'Analytics'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'leads' ? (
        <EmployeeLeadsView employeeId={employeeId} />
      ) : activeTab === 'analytics' ? (
        <EmployeeAnalyticsView employeeId={employeeId} baseURL={baseURL} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {dashData && (
            <>
              <SharedWidgetsGrid title="Overview" widgets={[
                { label: 'Total Booked', value: dashData.widgets.totalBooked, icon: Users, accent: 'indigo' },
                { label: 'Documents Pending', value: dashData.widgets.documentsPending, icon: FileText, accent: 'amber' },
                { label: 'Loan Cases', value: dashData.widgets.loanCases, icon: CircleDollarSign, accent: 'blue' },
                { label: 'Agreement Pending', value: dashData.widgets.agreementPending, icon: Edit, accent: 'purple' },
                { label: 'Possession Pending', value: dashData.widgets.possessionPending, icon: Key, accent: 'rose' },
                { label: 'Handover Completed', value: dashData.widgets.handoverCompleted, icon: CheckCircle, accent: 'emerald' },
              ]} />
              <View style={{ marginTop: 10 }} />
              <PendingListWidget title="Documents Pending" list={dashData.documentsList} statusFilter="DOCUMENT" emptyMessage="No documents pending." />
              <PendingListWidget title="Loan Cases" list={dashData.loanList} statusFilter="LOAN" emptyMessage="No loan cases in progress." />
              <PendingListWidget title="Agreement Pending" list={dashData.agreementList} statusFilter="AGREEMENT" emptyMessage="No agreements pending." />
              <PendingListWidget title="Possession Pending" list={dashData.possessionList} statusFilter="HANDOVER" emptyMessage="No possessions pending." />
              <PostSalesFollowUps todayFollowUpList={dashData.todayFollowUpList} confirmFollowUp={confirmFollowUp} />
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ─── Employee Leads Sub-view ───────────────────────────────────────────────────
function EmployeeLeadsView({ employeeId }: { employeeId: string }) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
    authClient.$fetch<any[]>(`/api/leads/employee/${employeeId}`, { baseURL })
      .then(res => { if (res.data) setLeads(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [employeeId]);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="small" color="#6366f1" />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 }}>
        Leads ({leads.length})
      </Text>
      {leads.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: '#94a3b8' }}>No post-sales leads found.</Text>
        </View>
      ) : (
        leads.map(lead => (
          <View key={lead.id} style={[styles.card, { padding: 16, marginBottom: 12 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#0f172a', marginBottom: 4 }}>{lead.firstName} {lead.lastName}</Text>
                <Text style={{ color: '#64748b', fontSize: 12 }}>{lead.interestedProject?.name || 'N/A'}</Text>
                <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                  Follow-up: {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString() : 'None'}
                </Text>
              </View>
              <View style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#475569' }}>{lead.status}</Text>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

// ─── Employee Analytics Sub-view ───────────────────────────────────────────────
function EmployeeAnalyticsView({ employeeId, baseURL }: { employeeId: string; baseURL: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');

  useEffect(() => {
    setLoading(true);
    authClient.$fetch<any>(
      `/api/dashboard/post-sales-manager/employees/${employeeId}/analytics?timeRange=${timeRange}`,
      { baseURL }
    )
      .then(res => { if (res.data) setData(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [employeeId, timeRange]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Time Range Selector */}
      <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' }}>
        {['weekly', 'monthly', 'yearly'].map(r => (
          <TouchableOpacity
            key={r}
            style={{ flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: timeRange === r ? '#4f46e5' : 'transparent' }}
            onPress={() => setTimeRange(r)}
          >
            <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: timeRange === r ? '#fff' : '#64748b', textTransform: 'capitalize' }}>
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : data ? (
        <>
          {/* Widgets */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Total Booked', value: data.widgets?.totalBooked ?? 0, color: '#6366f1' },
              { label: 'Handover Done', value: data.widgets?.totalHandoverCompleted ?? 0, color: '#10b981' },
              { label: 'Conversion %', value: `${data.widgets?.conversionRate ?? '0.0'}%`, color: '#f59e0b' },
            ].map((w, i) => (
              <View key={i} style={[styles.card, { width: '48%', padding: 16, alignItems: 'center' }]}>
                <Text style={{ fontSize: 26, fontWeight: 'bold', color: w.color }}>{w.value}</Text>
                <Text style={{ fontSize: 12, color: '#64748b', marginTop: 4, textAlign: 'center' }}>{w.label}</Text>
              </View>
            ))}
          </View>

          {/* Funnel */}
          {data.funnel && (
            <View style={[styles.card, { padding: 16, marginBottom: 12 }]}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 }}>Post-Sales Funnel</Text>
              {Object.entries(data.funnel).map(([key, val]: any) => (
                <View key={key} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>{key}</Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#0f172a' }}>{val}</Text>
                  </View>
                  <View style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 3 }}>
                    <View style={{ height: '100%', width: `${Math.min(100, (val / Math.max(1, data.funnel.booking)) * 100)}%`, backgroundColor: '#ec4899', borderRadius: 3 }} />
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      ) : (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <Text style={{ color: '#94a3b8' }}>No analytics data available.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
});
