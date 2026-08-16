import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { DashboardData } from '../misc/types';
import { TEMP_CONFIG, STATUS_LABEL } from '../misc/constants';

interface TodayFollowUpsProps {
  todayFollowUpList: DashboardData['todayFollowUpList'];
  confirmFollowUp: (followUpId: string) => void;
}

export default function TodayFollowUps({ todayFollowUpList, confirmFollowUp }: TodayFollowUpsProps) {
  const router = useRouter();

  return (
    <View className="mb-2 mt-2">
      <View className="flex-row justify-between items-center mb-3 px-1">
        <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest">Today's Follow-ups</Text>
        <View className="bg-emerald-100 px-2.5 py-1 rounded-lg">
          <Text className="text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider">Today</Text>
        </View>
      </View>
      <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm shadow-slate-200/50 mb-1">
        {todayFollowUpList.length === 0 ? (
          <Text className="text-slate-400 text-sm text-center py-5 font-medium">No follow-ups today.</Text>
        ) : (
          <View className="gap-3">
            {todayFollowUpList.map((fu, i) => {
              const temp = fu.lead?.temperature;
              const tempStyle = temp && TEMP_CONFIG[temp] ? TEMP_CONFIG[temp] : null;
              return (
                <TouchableOpacity key={fu.id} className={`flex-row items-center justify-between pb-3 ${i < todayFollowUpList.length - 1 ? 'border-b border-slate-50' : ''}`}>
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="w-10 h-10 rounded-full bg-slate-100 justify-center items-center">
                      <Text className="text-base font-bold text-slate-500">{fu.lead?.firstName?.charAt(0) || '?'}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-slate-900">{fu.lead ? `${fu.lead.firstName} ${fu.lead.lastName || ''}`.trim() : 'Unknown'}</Text>
                      <Text className="text-xs font-medium text-slate-500 mt-0.5">{STATUS_LABEL[fu.lead?.status || ''] || fu.lead?.status || '—'}</Text>
                    </View>
                  </View>
                  <View className="items-end gap-1.5">
                    {tempStyle && (
                      <View style={{ backgroundColor: tempStyle.bg }} className="px-2.5 py-0.5 rounded-full">
                        <Text style={{ color: tempStyle.text }} className="text-[10px] font-bold">{tempStyle.label}</Text>
                      </View>
                    )}
                    {(fu.status === 'SCHEDULED' || fu.status === 'RESCHEDULED' || fu.status === 'MISSED') ? (
                      <TouchableOpacity onPress={() => confirmFollowUp(fu.id)} className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <Text className="text-emerald-700 text-[11px] font-bold">✓ Confirm</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text className="text-[11px] font-bold text-emerald-500 px-2 py-1.5">Done ✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <TouchableOpacity onPress={() => router.push({ pathname: '/(dashboard)/pre-sales/lead-management', params: { followUpDate: new Date().toLocaleDateString('en-CA') } })} className="mt-4 bg-indigo-50 p-3.5 rounded-2xl">
          <Text className="text-center text-sm font-bold text-indigo-600 tracking-tight">See all follow-ups </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
