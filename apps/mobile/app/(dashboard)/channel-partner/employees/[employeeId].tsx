import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authClient } from '../../../../lib/auth-client';
import LiveTrackingMap from '@/components/maps/LiveTrackingMap';

export default function ChannelPartnerViewAsEmployee() {
  const router = useRouter();
  const { employeeId, role } = useLocalSearchParams<{ employeeId: string; role: string }>();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!employeeId || !role) return;
    try {
      setError(null);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
      const endpoint = `/api/dashboard/channel-partner/employees/${employeeId}/${role}/dashboard`;
      const res = await authClient.$fetch(endpoint, { baseURL: baseUrl });
      if (res.data) setData(res.data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load dashboard');
    }
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [employeeId, role]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8fafc]">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const roleTitle = role === 'sourcing' ? 'Sourcing Manager' : 'Closing Manager';

  return (
    <View className="flex-1 bg-[#f8fafc]">
      {/* View As Banner */}
      <View className="bg-indigo-600 px-4 pt-12 pb-4 flex-row items-center shadow-lg z-50">
        <Feather name="eye" size={16} color="#fff" style={{ marginRight: 8 }} />
        <Text className="text-white font-semibold text-sm flex-1">
          Viewing <Text className="font-bold">{roleTitle}</Text>'s Dashboard
        </Text>
        <TouchableOpacity
          className="bg-white/20 px-3 py-1.5 rounded-lg flex-row items-center"
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={14} color="#fff" style={{ marginRight: 4 }} />
          <Text className="text-white text-xs font-bold">Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {error && (
          <View className="bg-red-50 p-4 rounded-xl mb-4 border border-red-200">
            <Text className="text-red-500 text-sm">{error}</Text>
          </View>
        )}

        {role === 'sourcing' && data && (
          <View>
            <View className="flex-row flex-wrap justify-between gap-y-4 mb-6 mt-2">
              <View className="w-[48%] bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                <View className="w-10 h-10 bg-emerald-100 rounded-xl items-center justify-center mb-4">
                  <Feather name="user-check" size={20} color="#10b981" />
                </View>
                <Text className="text-xs font-bold text-slate-500 mb-1">Active Brokers</Text>
                <Text className="text-2xl font-black text-slate-900">{data.activeBrokers || 0}</Text>
              </View>
              <View className="w-[48%] bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mb-4">
                  <Feather name="user-plus" size={20} color="#3b82f6" />
                </View>
                <Text className="text-xs font-bold text-slate-500 mb-1">New Brokers</Text>
                <Text className="text-2xl font-black text-slate-900">{data.newBrokers || 0}</Text>
              </View>
              <View className="w-[48%] bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                <View className="w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mb-4">
                  <Feather name="calendar" size={20} color="#9333ea" />
                </View>
                <Text className="text-xs font-bold text-slate-500 mb-1">Meetings Today</Text>
                <Text className="text-2xl font-black text-slate-900">{data.todayMeetings || 0}</Text>
              </View>
              <View className="w-[48%] bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                <View className="w-10 h-10 bg-orange-100 rounded-xl items-center justify-center mb-4">
                  <Feather name="clock" size={20} color="#f97316" />
                </View>
                <Text className="text-xs font-bold text-slate-500 mb-1">Follow-ups Today</Text>
                <Text className="text-2xl font-black text-slate-900">{data.todayFollowUps || 0}</Text>
              </View>
            </View>

            <Text className="text-lg font-bold text-slate-900 mb-4 px-1">Revenue Overview</Text>

            <View className="bg-slate-900 rounded-3xl p-6 shadow-xl mb-4">
              <View className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                <Feather name="briefcase" size={20} color="#818cf8" />
              </View>
              <Text className="text-sm font-medium text-slate-400 mb-1">Bookings Generated</Text>
              <Text className="text-4xl font-black tracking-tight text-white">{data.revenueStats?.bookingsGenerated || 0}</Text>
            </View>

            <View className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-4">
              <Text className="text-xs font-bold text-slate-500 mb-1">Booking Revenue Generated</Text>
              <Text className="text-3xl font-black text-slate-900">
                ₹{(data.revenueStats?.bookingRevenueGenerated || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </Text>
            </View>

            {/* View Only Map */}
            <View className="bg-white rounded-2xl border border-slate-200 p-5 mt-4">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-3">
                  <Feather name="map-pin" size={18} color="#2563eb" />
                </View>
                <View>
                  <Text className="text-base font-bold text-slate-900">Live Location</Text>
                  <Text className="text-xs text-slate-500">Employee's last known location</Text>
                </View>
              </View>
              <View className="rounded-xl overflow-hidden h-48 border border-slate-100">
                <LiveTrackingMap />
              </View>
            </View>
          </View>
        )}

        {role === 'closing' && data && (
          <View>
            <View className="flex-row flex-wrap justify-between gap-y-4 mb-6 mt-2">
              <View className="w-[48%] bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                <View className="w-10 h-10 bg-emerald-100 rounded-xl items-center justify-center mb-4">
                  <Feather name="check-circle" size={20} color="#10b981" />
                </View>
                <Text className="text-xs font-bold text-slate-500 mb-1">Total Bookings</Text>
                <Text className="text-2xl font-black text-slate-900">{data.widgets?.totalBookings || 0}</Text>
              </View>
              <View className="w-[48%] bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mb-4">
                  <Feather name="home" size={20} color="#3b82f6" />
                </View>
                <Text className="text-xs font-bold text-slate-500 mb-1">Units Sold</Text>
                <Text className="text-2xl font-black text-slate-900">{data.widgets?.totalUnitsSold || 0}</Text>
              </View>
            </View>

            <Text className="text-lg font-bold text-slate-900 mb-4 px-1">Revenue Overview</Text>

            <View className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-6 shadow-sm mb-4">
              <View className="w-10 h-10 bg-indigo-600 rounded-xl items-center justify-center mb-4">
                <Feather name="trending-up" size={18} color="#ffffff" />
              </View>
              <Text className="text-xs font-bold text-indigo-900/60 mb-1">Total Revenue Generated</Text>
              <Text className="text-3xl font-black text-indigo-950">
                ₹{(data.widgets?.totalRevenueGenerated || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </Text>
            </View>

            <View className="bg-slate-900 rounded-3xl p-6 shadow-xl mb-4">
              <View className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                <FontAwesome5 name="rupee-sign" size={18} color="#818cf8" />
              </View>
              <Text className="text-sm font-medium text-slate-400 mb-1">Total Broker Commission</Text>
              <Text className="text-3xl font-black tracking-tight text-white">
                ₹{(data.widgets?.totalBrokerCommission || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </Text>
            </View>

            {/* List Counts */}
            <View className="bg-white rounded-2xl border border-slate-200 p-5 mt-4">
              <Text className="font-bold text-slate-900 mb-4">Pipeline Status</Text>
              <View className="flex-row justify-between mb-3 border-b border-slate-100 pb-3">
                <Text className="text-slate-600">Documentation Pending</Text>
                <Text className="font-bold text-slate-900">{data.listCounts?.documentPending || 0}</Text>
              </View>
              <View className="flex-row justify-between mb-3 border-b border-slate-100 pb-3">
                <Text className="text-slate-600">Loan Pending</Text>
                <Text className="font-bold text-slate-900">{data.listCounts?.loanPending || 0}</Text>
              </View>
              <View className="flex-row justify-between mb-3 border-b border-slate-100 pb-3">
                <Text className="text-slate-600">Agreement Pending</Text>
                <Text className="font-bold text-slate-900">{data.listCounts?.agreementPending || 0}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-slate-600">Handover Pending</Text>
                <Text className="font-bold text-slate-900">{data.listCounts?.handoverPending || 0}</Text>
              </View>
            </View>

          </View>
        )}
      </ScrollView>
    </View>
  );
}
