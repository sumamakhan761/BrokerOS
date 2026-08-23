import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import Toast from 'react-native-toast-message';
import { authClient } from '../../../lib/auth-client';
import { DashboardData, Announcement, LeaderboardEntry } from '../../../components/dashboards/pre-sales/misc/types';

// UI Components
import AnnouncementsList from '../../../components/dashboards/pre-sales/sections/AnnouncementsList';
import { SharedWidgetsGrid } from '../../../components/shared/SharedWidgetsGrid';
import PipelineStages from '../../../components/dashboards/pre-sales/widgets/PipelineStages';
import DailyTasks from '../../../components/dashboards/pre-sales/widgets/DailyTasks';
import BacklogsSection from '../../../components/dashboards/pre-sales/widgets/BacklogsSection';
import TodayFollowUps from '../../../components/dashboards/pre-sales/widgets/TodayFollowUps';
import { SharedLeaderboard } from '../../../components/shared/SharedLeaderboard';
import { Star, List, AlertTriangle, MapPin, Award, Trophy } from 'lucide-react-native';

export default function PreSalesDashboard() {
  const { data: session } = authClient.useSession();
  const baseURL = process.env.EXPO_PUBLIC_API_URL as string;

  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [leaderboard, setLeaderboard] = useState<{ leaderboard: LeaderboardEntry[]; currentUserId: string } | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // @ts-ignore
  const userName = session?.user?.name || 'Agent';

  const load = useCallback(async () => {
    try {
      const [dashRes, lbRes, annRes] = await Promise.all([
        authClient.$fetch<DashboardData>('/api/dashboard/pre-sales', { baseURL }),
        authClient.$fetch<{ leaderboard: LeaderboardEntry[]; currentUserId: string }>('/api/dashboard/pre-sales/leaderboard', { baseURL }),
        authClient.$fetch<Announcement[]>('/api/dashboard/pre-sales/my-announcements', { baseURL }),
      ]);
      if (dashRes.data) setDashData(dashRes.data);
      if (lbRes.data) setLeaderboard(lbRes.data);
      if (annRes.data) setAnnouncements(annRes.data);
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [baseURL]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const confirmFollowUp = async (followUpId: string) => {
    try {
      const { data } = await authClient.$fetch<{ success: boolean; message: string }>(
        `/api/dashboard/pre-sales/follow-ups/${followUpId}/confirm`,
        { baseURL, method: 'POST' }
      );
      if (data?.success) {
        Toast.show({ type: 'success', text1: '✅ Done!', text2: 'Follow-up confirmed successfully.' });
        load();
      } else {
        Toast.show({ type: 'info', text1: '⚠️ Cannot Confirm', text2: data?.message || 'No call record found for today.' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to confirm follow-up.' });
    }
  };

  const hasBacklog = (dashData?.dailyTasks.coldCall.backlog ?? 0) > 0 || (dashData?.dailyTasks.followUp.backlog ?? 0) > 0;
  const maxPipeline = dashData ? Math.max(1, ...Object.values(dashData.pipeline)) : 1;

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="text-slate-400 mt-3 text-sm font-medium">Loading dashboard…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerClassName="p-5 pb-12 gap-5"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="mb-2 mt-2">
        <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, {userName.split(' ')[0]} 👋
        </Text>
        <Text className="text-slate-500 mt-1.5 text-sm font-medium">
          Here's what's happening with your pipeline this month.
        </Text>
      </View>

      <AnnouncementsList announcements={announcements} />

      {dashData && (
        <>
          <SharedWidgetsGrid title="Overview" widgets={[
            { label: 'New Leads', value: dashData.widgets.newLeads, icon: Star, accent: 'indigo' },
            { label: 'Today\'s Follow-ups', value: dashData.widgets.todayFollowUps, icon: List, accent: 'emerald' },
            { label: 'Missed Follow-ups', value: dashData.widgets.missedFollowUps, icon: AlertTriangle, accent: 'amber' },
            { label: 'Site Visits', value: dashData.widgets.siteVisitsScheduled, icon: MapPin, accent: 'violet' },
            { label: 'Bookings', value: dashData.widgets.bookingsGenerated, icon: Award, accent: 'rose' },
          ]} />
          <PipelineStages pipeline={dashData.pipeline} maxPipeline={maxPipeline} />
          <DailyTasks dailyTasks={dashData.dailyTasks} hasBacklog={hasBacklog} />
          <BacklogsSection backlogs={dashData.backlogs} hasBacklog={hasBacklog} />
          <TodayFollowUps todayFollowUpList={dashData.todayFollowUpList} confirmFollowUp={confirmFollowUp} />
          <SharedLeaderboard
            title="Monthly Leaderboard"
            icon={<Trophy size={20} className="text-amber-500" />}
            data={leaderboard?.leaderboard || []}
            currentUserId={leaderboard?.currentUserId}
            columns={[
              { key: 'coldCalls', label: 'Calls', width: 'w-11', align: 'right' },
              { key: 'followUps', label: 'F-ups', width: 'w-11', align: 'right' },
              { key: 'siteVisits', label: 'Visits', width: 'w-11', align: 'right' },
              { key: 'score', label: 'Score', width: 'w-12', align: 'right', isPrimary: true },
            ]}
          />
        </>
      )}
    </ScrollView>
  );
}
