import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Users, Briefcase, CalendarCheck, Home, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { authClient } from '../../../../lib/auth-client';
import { Avatar } from '@/components/ui/Avatar';

type EmployeeStats = {
  totalBrokers?: number;
  siteVisits?: number;
  followUpsDone?: number;
  totalLeads?: number;
  bookingsGenerated?: number;
  unitsSold?: number;
};

type EmployeeCardData = {
  id: string;
  name: string;
  username: string;
  image: string | null;
  employeeCode: string;
  stats: EmployeeStats;
};

export default function EmployeesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'sourcing' | 'closing'>('sourcing');
  const [sourcingManagers, setSourcingManagers] = useState<EmployeeCardData[]>([]);
  const [closingManagers, setClosingManagers] = useState<EmployeeCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
      const [sourcingRes, closingRes] = await Promise.all([
        authClient.$fetch('/api/dashboard/channel-partner/employees/sourcing-managers', { baseURL: baseUrl }),
        authClient.$fetch('/api/dashboard/channel-partner/employees/closing-managers', { baseURL: baseUrl }),
      ]);
      if (sourcingRes.data) setSourcingManagers(sourcingRes.data as EmployeeCardData[]);
      if (closingRes.data) setClosingManagers(closingRes.data as EmployeeCardData[]);
    } catch (error) {
      console.error('Failed to fetch channel partner employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const timer = setTimeout(() => {
        if (isMounted) fetchEmployees();
      }, 100);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }, [])
  );

  const handleTabChange = (tab: 'sourcing' | 'closing') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleCardPress = (emp: EmployeeCardData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(dashboard)/channel-partner/employees/[employeeId]',
      params: { employeeId: emp.id, role: activeTab },
    });
  };

  const renderCard = (emp: EmployeeCardData) => {
    const isSourcing = activeTab === 'sourcing';

    return (
      <Pressable
        key={emp.id}
        onPress={() => handleCardPress(emp)}
        accessibilityRole="button"
        accessibilityLabel={`View ${emp.name} details`}
        className="bg-white rounded-3xl p-5 mb-4 shadow-xs border border-slate-200/80 active:scale-[0.98] transition-transform"
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1 pr-2">
            <Avatar
              name={emp.name || emp.username}
              imageUri={emp.image}
              size={52}
            />

            <View className="ml-3.5 flex-1">
              <Text
                className="text-base font-bold text-slate-900 leading-tight"
                numberOfLines={1}
                style={{ includeFontPadding: false }}
              >
                {emp.name}
              </Text>
              <Text className="text-slate-400 text-xs mt-0.5 font-medium">
                #{emp.employeeCode}
              </Text>
              <View className="bg-blue-50 px-2 py-0.5 rounded-full self-start mt-1 border border-blue-100">
                <Text
                  className="text-[10px] font-bold text-blue-700 uppercase tracking-wider"
                  style={{ includeFontPadding: false }}
                >
                  {isSourcing ? 'Sourcing Manager' : 'Closing Manager'}
                </Text>
              </View>
            </View>
          </View>
          <ChevronRight size={18} color="#94a3b8" strokeWidth={2.2} />
        </View>

        <View className="flex-row justify-between pt-3.5 border-t border-slate-100">
          {isSourcing ? (
            <>
              <View className="items-center flex-1">
                <Users size={16} color="#64748b" />
                <Text className="text-[11px] text-slate-500 font-medium mt-1">Brokers</Text>
                <Text className="text-sm font-black text-slate-900 mt-0.5">{emp.stats.totalBrokers || 0}</Text>
              </View>
              <View className="items-center flex-1 border-x border-slate-100">
                <CalendarCheck size={16} color="#10b981" />
                <Text className="text-[11px] text-slate-500 font-medium mt-1">Meetings</Text>
                <Text className="text-sm font-black text-emerald-600 mt-0.5">{emp.stats.siteVisits || 0}</Text>
              </View>
              <View className="items-center flex-1">
                <Briefcase size={16} color="#3b82f6" />
                <Text className="text-[11px] text-slate-500 font-medium mt-1">Follow-ups</Text>
                <Text className="text-sm font-black text-blue-600 mt-0.5">{emp.stats.followUpsDone || 0}</Text>
              </View>
            </>
          ) : (
            <>
              <View className="items-center flex-1">
                <Users size={16} color="#64748b" />
                <Text className="text-[11px] text-slate-500 font-medium mt-1">Leads</Text>
                <Text className="text-sm font-black text-slate-900 mt-0.5">{emp.stats.totalLeads || 0}</Text>
              </View>
              <View className="items-center flex-1 border-x border-slate-100">
                <Briefcase size={16} color="#2563eb" />
                <Text className="text-[11px] text-slate-500 font-medium mt-1">Bookings</Text>
                <Text className="text-sm font-black text-blue-600 mt-0.5">{emp.stats.bookingsGenerated || 0}</Text>
              </View>
              <View className="items-center flex-1">
                <Home size={16} color="#10b981" />
                <Text className="text-[11px] text-slate-500 font-medium mt-1">Units Sold</Text>
                <Text className="text-sm font-black text-emerald-600 mt-0.5">{emp.stats.unitsSold || 0}</Text>
              </View>
            </>
          )}
        </View>
      </Pressable>
    );
  };

  const listData = activeTab === 'sourcing' ? sourcingManagers : closingManagers;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="px-5 pt-2 pb-3">
        <Text className="text-2xl font-black text-slate-900">Your Employees</Text>
        <Text className="text-slate-500 text-sm mt-0.5 font-medium">Manage network performance and activities.</Text>
      </View>

      <View className="px-5 mb-3">
        <View className="flex-row bg-slate-200/60 p-1 rounded-2xl">
          <Pressable
            onPress={() => handleTabChange('sourcing')}
            className={`flex-1 py-2.5 rounded-xl items-center active:scale-[0.99] ${
              activeTab === 'sourcing' ? 'bg-white shadow-xs' : ''
            }`}
          >
            <Text
              className={`font-bold text-sm ${
                activeTab === 'sourcing' ? 'text-blue-600' : 'text-slate-500'
              }`}
            >
              Sourcing ({sourcingManagers.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleTabChange('closing')}
            className={`flex-1 py-2.5 rounded-xl items-center active:scale-[0.99] ${
              activeTab === 'closing' ? 'bg-white shadow-xs' : ''
            }`}
          >
            <Text
              className={`font-bold text-sm ${
                activeTab === 'closing' ? 'text-blue-600' : 'text-slate-500'
              }`}
            >
              Closing ({closingManagers.length})
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchEmployees} tintColor="#2563eb" />}
        showsVerticalScrollIndicator={false}
      >
        {listData.length > 0 ? (
          listData.map(renderCard)
        ) : !loading ? (
          <View className="items-center justify-center py-16 mt-6 bg-white rounded-3xl border border-slate-200/80">
            <View className="w-14 h-14 bg-slate-50 rounded-2xl items-center justify-center mb-3 border border-slate-200/60">
              <Users size={24} color="#94a3b8" />
            </View>
            <Text className="text-base font-bold text-slate-800">No employees found</Text>
            <Text className="text-slate-400 text-xs mt-1 text-center px-8">
              There are no {activeTab} managers assigned to your network yet.
            </Text>
          </View>
        ) : null}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
