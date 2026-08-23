import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Users, Briefcase, CalendarCheck, Home, ChevronRight } from 'lucide-react-native';
import { authClient } from '../../../../lib/auth-client';

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
  const [activeTab, setActiveTab] = useState<"sourcing" | "closing">("sourcing");
  const [sourcingManagers, setSourcingManagers] = useState<EmployeeCardData[]>([]);
  const [closingManagers, setClosingManagers] = useState<EmployeeCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
      const [sourcingRes, closingRes] = await Promise.all([
        authClient.$fetch('/api/dashboard/channel-partner/employees/sourcing-managers', { baseURL: baseUrl }),
        authClient.$fetch('/api/dashboard/channel-partner/employees/closing-managers', { baseURL: baseUrl })
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
      fetchEmployees();
    }, [])
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const renderCard = (emp: EmployeeCardData) => {
    const isSourcing = activeTab === "sourcing";

    return (
      <TouchableOpacity
        key={emp.id}
        onPress={() => router.push({ pathname: "/(dashboard)/channel-partner/employees/[employeeId]", params: { employeeId: emp.id, role: activeTab } })}
        className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100"
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <View className="w-14 h-14 rounded-2xl bg-indigo-50 items-center justify-center border border-indigo-100 mr-4 overflow-hidden">
              {emp.image ? (
                <Image source={{ uri: emp.image }} className="w-full h-full" />
              ) : (
                <Text className="text-indigo-600 font-bold text-lg">{getInitials(emp.name)}</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-900" numberOfLines={1}>{emp.name}</Text>
              <Text className="text-slate-500 text-sm mt-0.5">{emp.employeeCode}</Text>
              <View className="bg-indigo-50 px-2 py-1 rounded-md self-start mt-1">
                <Text className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  {isSourcing ? "Sourcing" : "Closing"}
                </Text>
              </View>
            </View>
          </View>
          <ChevronRight size={20} color="#cbd5e1" />
        </View>

        <View className="flex-row justify-between pt-4 border-t border-slate-100">
          {isSourcing ? (
            <>
              <View className="items-center flex-1">
                <Users size={16} color="#94a3b8" />
                <Text className="text-[11px] text-slate-500 font-medium mt-1">Brokers</Text>
                <Text className="text-sm font-bold text-slate-900 mt-0.5">{emp.stats.totalBrokers || 0}</Text>
              </View>
              <View className="items-center flex-1 border-x border-slate-100">
                <CalendarCheck size={16} color="#10b981" />
                <Text className="text-[11px] text-slate-500 font-medium mt-1">Meetings</Text>
                <Text className="text-sm font-bold text-emerald-600 mt-0.5">{emp.stats.siteVisits || 0}</Text>
              </View>
              <View className="items-center flex-1">
                <Briefcase size={16} color="#fb923c" />
                <Text className="text-[11px] text-slate-500 font-medium mt-1">Follow-ups</Text>
                <Text className="text-sm font-bold text-orange-500 mt-0.5">{emp.stats.followUpsDone || 0}</Text>
              </View>
            </>
          ) : (
            <>
              <View className="items-center flex-1">
                <Users size={16} color="#94a3b8" />
                <Text className="text-[11px] text-slate-500 font-medium mt-1">Leads</Text>
                <Text className="text-sm font-bold text-slate-900 mt-0.5">{emp.stats.totalLeads || 0}</Text>
              </View>
              <View className="items-center flex-1 border-x border-slate-100">
                <Briefcase size={16} color="#6366f1" />
                <Text className="text-[11px] text-slate-500 font-medium mt-1">Bookings</Text>
                <Text className="text-sm font-bold text-indigo-600 mt-0.5">{emp.stats.bookingsGenerated || 0}</Text>
              </View>
              <View className="items-center flex-1">
                <Home size={16} color="#10b981" />
                <Text className="text-[11px] text-slate-500 font-medium mt-1">Units Sold</Text>
                <Text className="text-sm font-bold text-emerald-600 mt-0.5">{emp.stats.unitsSold || 0}</Text>
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const listData = activeTab === "sourcing" ? sourcingManagers : closingManagers;

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]" edges={['top']}>
      <View className="px-6 pt-2 pb-4">
        <Text className="text-2xl font-black text-slate-900">Your Employees</Text>
        <Text className="text-slate-500 text-sm mt-1">Manage performance and activities.</Text>
      </View>

      <View className="px-6 mb-4">
        <View className="flex-row bg-slate-200/50 p-1 rounded-2xl">
          <TouchableOpacity
            onPress={() => setActiveTab("sourcing")}
            className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === "sourcing" ? "bg-white shadow-sm" : ""}`}
          >
            <Text className={`font-bold text-sm ${activeTab === "sourcing" ? "text-indigo-600" : "text-slate-500"}`}>
              Sourcing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("closing")}
            className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === "closing" ? "bg-white shadow-sm" : ""}`}
          >
            <Text className={`font-bold text-sm ${activeTab === "closing" ? "text-indigo-600" : "text-slate-500"}`}>
              Closing
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchEmployees} tintColor="#6366f1" />}
      >
        {listData.length > 0 ? (
          listData.map(renderCard)
        ) : !loading ? (
          <View className="items-center justify-center py-20 mt-10 bg-white rounded-3xl border border-slate-100 border-dashed">
            <View className="w-16 h-16 bg-slate-50 rounded-full items-center justify-center mb-4">
              <Users size={24} color="#94a3b8" />
            </View>
            <Text className="text-lg font-bold text-slate-800">No employees found</Text>
            <Text className="text-slate-500 text-sm mt-1 text-center px-8">
              There are no {activeTab} managers assigned to you yet.
            </Text>
          </View>
        ) : null}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
