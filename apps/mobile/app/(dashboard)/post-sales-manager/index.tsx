import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import Toast from 'react-native-toast-message';
import { authClient } from '../../../lib/auth-client';
import { PostSalesDashboardData } from '../../../components/dashboards/post-sales/misc/types';

import { SharedWidgetsGrid } from '../../../components/shared/SharedWidgetsGrid';
import PendingListWidget from '../../../components/dashboards/post-sales/widgets/PendingListWidget';
import PostSalesFollowUps from '../../../components/dashboards/post-sales/widgets/PostSalesFollowUps';
import { Users, FileText, CircleDollarSign, Edit, Key, CheckCircle } from 'lucide-react-native';

export default function PostSalesDashboard() {
  const { data: session } = authClient.useSession();
  const baseURL = process.env.EXPO_PUBLIC_API_URL as string;

  const [dashData, setDashData] = useState<PostSalesDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await authClient.$fetch<PostSalesDashboardData>('/api/dashboard/post-sales', { baseURL });
      if (res.data) setDashData(res.data);
    } catch (e: any) {
      console.error(e);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load post-sales dashboard' });
    }
  };

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, []);

  const confirmFollowUp = async (followUpId: string) => {
    try {
      const res = await authClient.$fetch<{ success: boolean; message: string }>(`/api/dashboard/pre-sales/follow-ups/${followUpId}/confirm`, {
        method: 'POST',
        baseURL,
      });
      if (res.data?.success) {
        Toast.show({ type: 'success', text1: 'Success', text2: 'Follow-up confirmed successfully.' });
        fetchData();
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: res.data?.message || 'Failed to confirm follow-up.' });
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e?.message || 'Failed to confirm follow-up.' });
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

  // @ts-ignore
  const userName = session?.user?.name || "Agent";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#0f172a' }}>
          Welcome back, {userName.split(' ')[0]} 👋
        </Text>
        <Text style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
          Here's what's happening in your post-sales pipeline.
        </Text>
      </View>

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
          <PendingListWidget title="Documents Pending" list={dashData.documentsList} statusFilter="DOCUMENT" emptyMessage="No documents pending." baseRoute="/(dashboard)/post-sales-manager" />
          <PendingListWidget title="Loan Cases in Progress" list={dashData.loanList} statusFilter="LOAN" emptyMessage="No loan cases in progress." baseRoute="/(dashboard)/post-sales-manager" />
          <PendingListWidget title="Agreement Pending" list={dashData.agreementList} statusFilter="AGREEMENT" emptyMessage="No agreements pending." baseRoute="/(dashboard)/post-sales-manager" />
          <PendingListWidget title="Possession Pending" list={dashData.possessionList} statusFilter="HANDOVER" emptyMessage="No possessions pending." baseRoute="/(dashboard)/post-sales-manager" />
          <PostSalesFollowUps todayFollowUpList={dashData.todayFollowUpList} confirmFollowUp={confirmFollowUp} baseRoute="/(dashboard)/post-sales-manager" />
        </>
      )}
    </ScrollView>
  );
}
