import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DashboardData } from '../misc/types';

export default function SalesExecTasks({ dashData }: { dashData: DashboardData }) {
  const [activeTab, setActiveTab] = useState<'TODAY_SV' | 'BACKLOG_SV' | 'FOLLOW_UPS'>('TODAY_SV');

  const todaySVs = dashData.todaySiteVisitList || [];
  const backlogSVs = dashData.backlogSiteVisitList || [];
  const followUps = [...(dashData.missedFollowUpBacklog || []), ...(dashData.todayFollowUpList || [])];

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-3 px-1 mt-2">
        <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest">📋 Daily Tasks</Text>
      </View>

      <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm shadow-slate-200/50">
        <View className="flex-row border-b border-slate-100 mb-4 pb-1">
          <TouchableOpacity
            className={`flex-1 pb-2 items-center border-b-2 ${activeTab === 'TODAY_SV' ? 'border-indigo-600' : 'border-transparent'}`}
            onPress={() => setActiveTab('TODAY_SV')}
          >
            <Text className={`text-[11px] font-bold ${activeTab === 'TODAY_SV' ? 'text-indigo-600' : 'text-slate-400'}`}>
              Today SVs ({todaySVs.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 pb-2 items-center border-b-2 ${activeTab === 'BACKLOG_SV' ? 'border-rose-500' : 'border-transparent'}`}
            onPress={() => setActiveTab('BACKLOG_SV')}
          >
            <Text className={`text-[11px] font-bold ${activeTab === 'BACKLOG_SV' ? 'text-rose-500' : 'text-slate-400'}`}>
              Backlog ({backlogSVs.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 pb-2 items-center border-b-2 ${activeTab === 'FOLLOW_UPS' ? 'border-emerald-500' : 'border-transparent'}`}
            onPress={() => setActiveTab('FOLLOW_UPS')}
          >
            <Text className={`text-[11px] font-bold ${activeTab === 'FOLLOW_UPS' ? 'text-emerald-500' : 'text-slate-400'}`}>
              F-Ups ({followUps.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ maxHeight: 300 }}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {activeTab === 'TODAY_SV' && <ListSVs items={todaySVs} emptyMsg="No site visits scheduled for today." iconBg="bg-indigo-50" iconColorHex="#6366f1" btnBg="bg-indigo-50" btnIconHex="#4f46e5" />}
            {activeTab === 'BACKLOG_SV' && <ListSVs items={backlogSVs} emptyMsg="No backlog site visits. Great job!" isBacklog iconBg="bg-rose-50" iconColorHex="#f43f5e" btnBg="bg-rose-50" btnIconHex="#e11d48" />}
            {activeTab === 'FOLLOW_UPS' && <ListFollowUps items={followUps} emptyMsg="No follow-ups scheduled for today." />}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

function ListSVs({ items, emptyMsg, isBacklog = false, iconBg, iconColorHex, btnBg, btnIconHex }: { items: any[], emptyMsg: string, isBacklog?: boolean, iconBg: string, iconColorHex: string, btnBg: string, btnIconHex: string }) {
  const router = useRouter();

  if (items.length === 0) {
    return <Text className="text-slate-400 text-sm text-center py-8 font-medium">{emptyMsg}</Text>;
  }
  return (
    <View className="gap-3 pb-2">
      {items.map((sv, i) => (
        <TouchableOpacity
          key={sv.id}
          className={`flex-row items-center justify-between pb-3 ${i < items.length - 1 ? 'border-b border-slate-50' : ''}`}
          onPress={() => router.push({ pathname: '/(dashboard)/sales-executive/lead-management/[id]', params: { id: sv.lead.id } } as any)}
        >
          <View className="flex-row items-center gap-3 flex-1">
            <View className={`w-10 h-10 rounded-full ${iconBg} justify-center items-center`}>
              <Feather name="map-pin" size={18} color={iconColorHex} />
            </View>
            <View className="flex-1 pr-2">
              <View className="flex-row items-center gap-2">
                <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>{sv.lead?.firstName} {sv.lead?.lastName}</Text>
                {isBacklog && (
                  <View className="bg-rose-50 px-2 py-0.5 rounded-full">
                    <Text className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Missed</Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-center gap-1.5 mt-1">
                <Text className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider">{sv.project?.name || 'Unknown'}</Text>
                <Text className="text-[10px] font-medium text-slate-400">{new Date(sv.scheduledDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</Text>
              </View>
            </View>
          </View>
          <View className={`w-8 h-8 rounded-lg flex items-center justify-center ${btnBg}`}>
            <Feather name="chevron-right" size={16} color={btnIconHex} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ListFollowUps({ items, emptyMsg }: { items: any[], emptyMsg: string }) {
  const router = useRouter();

  if (items.length === 0) {
    return <Text className="text-slate-400 text-sm text-center py-8 font-medium">{emptyMsg}</Text>;
  }
  return (
    <View className="gap-3 pb-2">
      {items.map((fup, i) => (
        <TouchableOpacity
          key={fup.id}
          className={`flex-row items-center justify-between pb-3 ${i < items.length - 1 ? 'border-b border-slate-50' : ''}`}
          onPress={() => router.push({ pathname: '/(dashboard)/sales-executive/lead-management/[id]', params: { id: fup.lead.id } } as any)}
        >
          <View className="flex-row items-center gap-3 flex-1">
            <View className="w-10 h-10 rounded-full bg-emerald-50 justify-center items-center">
              <Feather name="phone-forwarded" size={18} color="#10b981" />
            </View>
            <View className="flex-1 pr-2">
              <View className="flex-row items-center gap-2">
                <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>{fup.lead?.firstName} {fup.lead?.lastName}</Text>
                {fup.status === 'MISSED' && (
                  <View className="bg-rose-50 px-2 py-0.5 rounded-full">
                    <Text className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Missed</Text>
                  </View>
                )}
              </View>
              <Text className="text-xs font-medium text-slate-500 mt-1">Scheduled: {new Date(fup.scheduledDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</Text>
            </View>
          </View>
          <View className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50">
            <Feather name="chevron-right" size={16} color="#059669" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
