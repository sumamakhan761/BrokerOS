import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { authClient } from '../../../lib/auth-client';
import { SharedWidgetsGrid } from '../../../components/shared/SharedWidgetsGrid';
import { TeamBacklogs } from '../../../components/dashboards/pre-sales-manager/widgets/TeamBacklogs';
import { TeamPipeline } from '../../../components/dashboards/pre-sales-manager/widgets/TeamPipeline';
import { TodayFollowUps } from '../../../components/dashboards/pre-sales-manager/widgets/TodayFollowUps';
import { MonthlyLeaderboard } from '../../../components/dashboards/pre-sales-manager/widgets/MonthlyLeaderboard';
import { Users, FileText, CheckCircle, PhoneMissed, Briefcase, TrendingUp, Activity, AlertCircle } from 'lucide-react-native';

// ── Types ──────────────────────────────────────────────────────────────────

interface DashboardData {
  widgets: {
    totalLeads: number;
    newLeads: number;
    activeLeads: number;
    lostLeads: number;
    todayFollowUps: number;
    missedFollowUps: number;
    siteVisitsScheduled: number;
    conversionRate: number;
  };
  pipeline: Record<string, number>;
  backlogs: Array<{
    id: string;
    name: string;
    missedFollowUps: number;
    untouchedLeads: number;
  }>;
  todayFollowUpList: Array<{
    id: string;
    scheduledDate: string;
    status: string;
    user?: {
      id: string;
      name: string;
      username: string;
    };
    lead: { id: string; firstName: string; lastName?: string; temperature?: string; status: string } | null;
  }>;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  coldCalls: number;
  followUps: number;
  siteVisits: number;
  score: number;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function PreSalesManagerDashboard() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const baseURL = process.env.EXPO_PUBLIC_API_URL as string;

  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [leaderboard, setLeaderboard] = useState<{ leaderboard: LeaderboardEntry[]; currentUserId: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // @ts-ignore
  const userName = session?.user?.name || session?.user?.username || 'Manager';

  const load = useCallback(async () => {
    try {
      const [dashRes, lbRes] = await Promise.all([
        authClient.$fetch<DashboardData>('/api/dashboard/pre-sales-manager', { baseURL }),
        authClient.$fetch<{ leaderboard: LeaderboardEntry[]; currentUserId: string }>('/api/dashboard/pre-sales-manager/leaderboard', { baseURL }),
      ]);
      if (dashRes?.data) setDashData(dashRes.data as DashboardData);
      if (Array.isArray(lbRes?.data)) {
        let lboard = lbRes.data.map((r, i) => ({ ...r, rank: i + 1 }));
        setLeaderboard({ leaderboard: lboard, currentUserId: session?.user?.id || '' });
      }
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [baseURL]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

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
      contentContainerClassName="p-5 pt-12 pb-12 gap-5"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="mb-2 mt-2">
        <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Hello, {userName.split(' ')[0]} 👋
        </Text>
        <Text className="text-slate-500 mt-1.5 text-sm font-medium">
          Here's your team's performance overview.
        </Text>
      </View>

      {dashData && (
        <>
          <SharedWidgetsGrid widgets={[
            { label: 'Total Leads', value: dashData.widgets.totalLeads, icon: Users, accent: 'slate' },
            { label: 'New Leads', value: dashData.widgets.newLeads, icon: FileText, accent: 'indigo' },
            { label: 'Active Leads', value: dashData.widgets.activeLeads, icon: Activity, accent: 'emerald' },
            { label: 'Lost Leads', value: dashData.widgets.lostLeads, icon: AlertCircle, accent: 'rose' },
            { label: 'Follow-ups', value: dashData.widgets.todayFollowUps, icon: CheckCircle, accent: 'teal' },
            { label: 'Missed F-ups', value: dashData.widgets.missedFollowUps, icon: PhoneMissed, accent: 'rose' },
            { label: 'Site Visits', value: dashData.widgets.siteVisitsScheduled, icon: Briefcase, accent: 'violet' },
            { label: 'Conv. Rate', value: dashData.widgets.conversionRate + '%', icon: TrendingUp, accent: 'amber' },
          ]} />
          <TeamBacklogs backlogs={dashData.backlogs} />
          <TeamPipeline pipeline={dashData.pipeline} />
          <TodayFollowUps followUps={dashData.todayFollowUpList} />
          <MonthlyLeaderboard leaderboard={leaderboard?.leaderboard || []} />
        </>
      )}
    </ScrollView>
  );
}
