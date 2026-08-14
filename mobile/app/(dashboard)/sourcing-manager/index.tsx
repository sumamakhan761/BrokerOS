import { View, Text, ActivityIndicator, ScrollView, Switch } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { authClient } from '../../../lib/auth-client';
import { useLocationTracking } from '../../../hooks/useLocationTracking';
import LiveTrackingMap from '../../../components/maps/LiveTrackingMap';

export default function SourcingManagerScreen() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id || '';
  const { isTracking, toggleTracking, errorMsg } = useLocationTracking(userId);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
        const res = await authClient.$fetch('/api/dashboard/sourcing-manager', { baseURL });
        if (res.error) throw new Error(res.error.message || "Failed");
        setData(res.data);
      } catch (err: any) {
        setError(err?.response?.status === 403 ? "Access Denied (403)" : "Connection Error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8fafc]">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8fafc] p-6">
        <View className="bg-red-50 p-6 rounded-3xl border border-red-200 items-center w-full">
          <Feather name="alert-circle" size={32} color="#dc2626" />
          <Text className="text-red-600 font-bold text-lg mt-2">Failed to load Dashboard</Text>
          <Text className="text-red-500 text-center mt-1">{error}</Text>
        </View>
      </View>
    );
  }

  const { 
    activeBrokers, 
    newBrokers, 
    todayMeetings, 
    todayFollowUps, 
    revenueStats,
    todayFollowUpList,
    todayMeetingList,
    topPerformingBrokers
  } = data;

  return (
    <ScrollView className="flex-1 bg-[#f8fafc]" contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      <View className="mb-8">
        <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</Text>
        <Text className="text-slate-500 text-sm font-medium mt-1">Track your performance & revenue</Text>
      </View>

      {/* Grid for Activities */}
      <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
        {/* Active Brokers */}
        <View className="w-[48%] bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <View className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full" />
          <View className="w-10 h-10 bg-emerald-100 rounded-xl items-center justify-center mb-4">
            <Feather name="user-check" size={20} color="#10b981" />
          </View>
          <Text className="text-xs font-bold text-slate-500 mb-1">Active Brokers</Text>
          <Text className="text-2xl font-black text-slate-900">{activeBrokers}</Text>
        </View>

        {/* New Brokers */}
        <View className="w-[48%] bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <View className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full" />
          <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mb-4">
            <Feather name="user-plus" size={20} color="#3b82f6" />
          </View>
          <Text className="text-xs font-bold text-slate-500 mb-1">New Brokers</Text>
          <Text className="text-2xl font-black text-slate-900">{newBrokers}</Text>
        </View>

        {/* Today's Meetings */}
        <View className="w-[48%] bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <View className="absolute -right-4 -top-4 w-16 h-16 bg-purple-50 rounded-full" />
          <View className="w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mb-4">
            <Feather name="calendar" size={20} color="#9333ea" />
          </View>
          <Text className="text-xs font-bold text-slate-500 mb-1">Meetings Today</Text>
          <Text className="text-2xl font-black text-slate-900">{todayMeetings}</Text>
        </View>

        {/* Today's Follow ups */}
        <View className="w-[48%] bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <View className="absolute -right-4 -top-4 w-16 h-16 bg-orange-50 rounded-full" />
          <View className="w-10 h-10 bg-orange-100 rounded-xl items-center justify-center mb-4">
            <Feather name="clock" size={20} color="#f97316" />
          </View>
          <Text className="text-xs font-bold text-slate-500 mb-1">Follow-ups Today</Text>
          <Text className="text-2xl font-black text-slate-900">{todayFollowUps}</Text>
        </View>
      </View>

      <Text className="text-xl font-bold text-slate-900 mb-4 px-1">Revenue & Performance</Text>

      {/* Bookings Generated */}
      <View className="bg-slate-900 rounded-3xl p-6 shadow-xl mb-4 relative overflow-hidden">
        <View className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl" />
        <View className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
          <Feather name="briefcase" size={24} color="#818cf8" />
        </View>
        <Text className="text-sm font-medium text-slate-400 mb-1">Bookings Generated</Text>
        <Text className="text-4xl font-black tracking-tight text-white">{revenueStats.bookingsGenerated || 0}</Text>
      </View>

      {/* Booking Revenue */}
      <View className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-4 relative overflow-hidden">
        <View className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-50 rounded-full" />
        <View className="w-10 h-10 bg-emerald-100 rounded-xl items-center justify-center mb-4">
          <FontAwesome5 name="building" size={16} color="#10b981" />
        </View>
        <Text className="text-xs font-bold text-slate-500 mb-1">Booking Revenue Generated</Text>
        <Text className="text-3xl font-black text-slate-900">
          ₹{(revenueStats.bookingRevenueGenerated || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </Text>
      </View>

      {/* Broker Commission */}
      <View className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-4 relative overflow-hidden">
        <View className="absolute -right-8 -top-8 w-24 h-24 bg-blue-50 rounded-full" />
        <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mb-4">
          <FontAwesome5 name="rupee-sign" size={16} color="#3b82f6" />
        </View>
        <Text className="text-xs font-bold text-slate-500 mb-1">Broker Commission Paid</Text>
        <Text className="text-3xl font-black text-slate-900">
          ₹{(revenueStats.brokerCommissionPaid || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </Text>
      </View>

      {/* Broker Revenue Generated (Handover) */}
      <View className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-6 shadow-sm relative overflow-hidden mb-4">
        <View className="absolute -right-8 -bottom-8 w-24 h-24 bg-indigo-200/50 rounded-full blur-xl" />
        <View className="w-10 h-10 bg-indigo-600 rounded-xl items-center justify-center mb-4 shadow-md shadow-indigo-600/30">
          <Feather name="trending-up" size={18} color="#ffffff" />
        </View>
        <Text className="text-xs font-bold text-indigo-900/60 mb-1">Revenue from handover part</Text>
        <Text className="text-3xl font-black text-indigo-950">
          ₹{(revenueStats.brokerRevenueGenerated || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </Text>
        <Text className="text-[10px] text-indigo-900/50 font-medium mt-2">Agreed price from completed handovers</Text>
      </View>

      {/* Today's Tasks */}
      <View className="mt-8 mb-4">
        <Text className="text-xl font-bold text-slate-900 mb-4 px-1">Today's Tasks</Text>
        
        {(!todayMeetingList?.length && !todayFollowUpList?.length) ? (
          <View className="bg-white rounded-2xl p-6 border border-slate-200 items-center justify-center">
            <Feather name="check-circle" size={32} color="#cbd5e1" />
            <Text className="text-slate-500 font-medium mt-3">No tasks for today. You're all caught up!</Text>
          </View>
        ) : (
          <View className="space-y-4">
            {todayMeetingList?.map((meeting: any) => (
              <View key={meeting.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex-row items-center mt-3">
                <View className="w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mr-4">
                  <Feather name="calendar" size={20} color="#9333ea" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-bold">{meeting.title || 'Meeting'}</Text>
                  <Text className="text-slate-500 text-xs mt-0.5">
                    {new Date(meeting.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} • Broker: {meeting.broker?.name || 'Unknown'}
                  </Text>
                </View>
              </View>
            ))}
            
            {todayFollowUpList?.map((followUp: any) => (
              <View key={followUp.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex-row items-center mt-3">
                <View className="w-10 h-10 bg-orange-100 rounded-xl items-center justify-center mr-4">
                  <Feather name="clock" size={20} color="#f97316" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-bold">{followUp.title || 'Follow-up'}</Text>
                  <Text className="text-slate-500 text-xs mt-0.5">
                    {new Date(followUp.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} • Broker: {followUp.broker?.name || 'Unknown'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Broker Leaderboard */}
      <View className="mt-8 mb-4">
        <Text className="text-xl font-bold text-slate-900 mb-4 px-1">Team Performance</Text>
        
        {(!topPerformingBrokers || topPerformingBrokers.length === 0) ? (
          <View className="bg-white rounded-2xl p-6 border border-slate-200 items-center justify-center">
            <Feather name="award" size={32} color="#cbd5e1" />
            <Text className="text-slate-500 font-medium mt-3">No performance data available yet.</Text>
          </View>
        ) : (
          <View className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {topPerformingBrokers.map((broker: any, idx: number) => (
              <View key={broker.id} className={`p-4 flex-row items-center ${idx !== topPerformingBrokers.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <View className="w-8 items-center justify-center">
                  <Text className="font-bold text-slate-400">#{idx + 1}</Text>
                </View>
                <View className="w-10 h-10 bg-indigo-100 rounded-full mx-3 items-center justify-center">
                  <Text className="text-indigo-700 font-bold">{broker.name ? broker.name.charAt(0).toUpperCase() : 'B'}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-bold">{broker.name}</Text>
                  <Text className="text-slate-500 text-xs mt-0.5">Score: {broker.score}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-emerald-600 font-bold">{broker.bookingsGenerated} Bookings</Text>
                  <Text className="text-slate-500 text-xs mt-0.5">{broker.unitsSold} Units</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Live Location Tracking */}
      <View className="bg-white rounded-3xl p-5 shadow-sm shadow-slate-200 border border-slate-100 mb-4 mt-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center">
              <Feather name="map-pin" size={18} color="#2563eb" />
            </View>
            <View>
              <Text className="text-base font-bold text-slate-900">Live Location Tracking</Text>
              <Text className="text-xs text-slate-500">Share location with managers</Text>
            </View>
          </View>
          <Switch
            value={isTracking}
            onValueChange={toggleTracking}
            trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
            thumbColor={isTracking ? '#2563eb' : '#f8fafc'}
          />
        </View>

        {errorMsg ? (
          <Text className="text-red-500 text-xs mb-3">{errorMsg}</Text>
        ) : (
          <View className="flex-row items-center bg-slate-50 p-3 rounded-xl mb-4">
            <View className={`w-2 h-2 rounded-full mr-2 ${isTracking ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <Text className="text-slate-600 text-xs font-medium">
              {isTracking ? 'Active & sharing location' : 'Tracking paused'}
            </Text>
          </View>
        )}

        <View className="rounded-2xl overflow-hidden border border-slate-100">
          <LiveTrackingMap />
        </View>
      </View>

    </ScrollView>
  );
}