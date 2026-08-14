import { View, Text, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { authClient } from '../../../lib/auth-client';
import { CPDashboardWidgets } from '../../../components/dashboards/channel-partner/CPDashboardWidgets';
import { CPActionTasks } from '../../../components/dashboards/channel-partner/CPActionTasks';
import { CPLeaderboards } from '../../../components/dashboards/channel-partner/CPLeaderboards';

export default function ChannelPartnerScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
        const res = await authClient.$fetch('/api/dashboard/channel-partner', { baseURL });
        setData(res?.data || res);
      } catch (err: any) {
        setError(err?.response?.status === 403 ? "Access Denied (403)" : "Connection Error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <ScrollView className="flex-1 bg-[#f8fafc]">
      <View className="p-6">
        <View className="items-center mb-8 mt-2">
          <View className="w-16 h-16 rounded-2xl bg-lime-100 items-center justify-center mb-4">
            <Feather name="link" size={32} color="#65a30d" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">Channel Partner CRM</Text>
          <Text className="text-gray-500 text-center mt-2">Partner network and leads.</Text>
        </View>

        {loading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color="#65a30d" />
          </View>
        ) : error ? (
          <View className="bg-red-50 p-6 rounded-2xl border border-red-200 items-center">
            <Feather name="alert-circle" size={32} color="#dc2626" />
            <Text className="text-red-600 font-bold text-lg mt-2">Unauthorized</Text>
            <Text className="text-red-500 text-center mt-1">{error}</Text>
          </View>
        ) : data ? (
          <>
            <CPDashboardWidgets kpis={data.kpis} />
            <CPActionTasks tasks={data.actionTasks} />
            <CPLeaderboards leaderboards={data.leaderboards} />
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}