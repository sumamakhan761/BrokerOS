import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { authClient } from '../../../lib/auth-client';
import { PostSalesDashboardData } from '../../../components/dashboards/post-sales/misc/types';

import PostSalesOverviewWidgets from '../../../components/dashboards/post-sales/widgets/PostSalesOverviewWidgets';
import PendingListWidget from '../../../components/dashboards/post-sales/widgets/PendingListWidget';
import PostSalesFollowUps from '../../../components/dashboards/post-sales/widgets/PostSalesFollowUps';

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
      Alert.alert('Error', 'Failed to load post-sales dashboard');
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
        Alert.alert('Success', 'Follow-up confirmed successfully.');
        fetchData();
      } else {
        Alert.alert('Error', res.data?.message || 'Failed to confirm follow-up.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to confirm follow-up.');
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
          <PostSalesOverviewWidgets widgets={dashData.widgets} />
          <View style={{ marginTop: 10 }} />
          <PendingListWidget title="Documents Pending" list={dashData.documentsList} statusFilter="DOCUMENT" emptyMessage="No documents pending." />
          <PendingListWidget title="Loan Cases in Progress" list={dashData.loanList} statusFilter="LOAN" emptyMessage="No loan cases in progress." />
          <PendingListWidget title="Agreement Pending" list={dashData.agreementList} statusFilter="AGREEMENT" emptyMessage="No agreements pending." />
          <PendingListWidget title="Possession Pending" list={dashData.possessionList} statusFilter="HANDOVER" emptyMessage="No possessions pending." />
          <PostSalesFollowUps todayFollowUpList={dashData.todayFollowUpList} confirmFollowUp={confirmFollowUp} />
        </>
      )}
    </ScrollView>
  );
}
