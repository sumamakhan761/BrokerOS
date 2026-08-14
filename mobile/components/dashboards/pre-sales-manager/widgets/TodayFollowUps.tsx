import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';
import { PhoneForwarded, ChevronRight } from 'lucide-react-native';

const TEMP_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  HOT: { label: 'Hot', bg: 'bg-rose-100', text: 'text-rose-700' },
  WARM: { label: 'Warm', bg: 'bg-amber-100', text: 'text-amber-700' },
  COLD: { label: 'Cold', bg: 'bg-blue-100', text: 'text-blue-700' },
};

export function TodayFollowUps({ followUps }: { followUps: any[] }) {
  const router = useRouter();
  return (
    <View className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
      <View className="flex-row items-center gap-2 mb-4">
        <View className="bg-emerald-50 p-2 rounded-lg">
          <PhoneForwarded size={20} className="text-emerald-600" />
        </View>
        <Text className="text-sm font-bold text-slate-500 uppercase tracking-wider">Team's Today Follow-ups</Text>
      </View>
      {followUps.length === 0 ? (
        <View className="py-6 items-center">
          <Text className="text-slate-400 font-medium text-sm">No follow-ups today across the team.</Text>
        </View>
      ) : (
        <View className="gap-2">
          {followUps.map((fu, i) => {
            const temp = fu.lead?.temperature;
            const tempConf = temp ? TEMP_CONFIG[temp] : null;
            return (
              <View key={fu.id} className={`flex-row items-center justify-between pb-3 ${i < followUps.length - 1 ? 'border-b border-slate-50' : ''}`}>
                <View className="flex-row items-center gap-3 flex-1">
                  <Avatar name={fu.lead?.firstName} size={36} />
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>
                      {fu.lead ? `${fu.lead.firstName} ${fu.lead.lastName || ''}`.trim() : 'Unknown Lead'}
                    </Text>
                    <Text className="text-[11px] font-semibold text-slate-500 mt-0.5">
                      Agent: {fu.user?.name || fu.user?.username || 'Unknown'}
                    </Text>
                  </View>
                </View>
                {tempConf && (
                  <View className={`px-2 py-0.5 rounded-full ${tempConf.bg}`}>
                    <Text className={`text-[10px] font-bold uppercase tracking-wider ${tempConf.text}`}>{tempConf.label}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
      <TouchableOpacity 
        onPress={() => router.push({ pathname: '/(dashboard)/pre-sales-manager/lead-management' as any, params: { followUpDate: new Date().toLocaleDateString('en-CA') } })} 
        className="mt-2 bg-indigo-50 py-3 rounded-xl flex-row justify-center items-center gap-1"
      >
        <Text className="text-xs font-bold text-indigo-600">See all follow-ups</Text>
        <ChevronRight size={14} className="text-indigo-600" />
      </TouchableOpacity>
    </View>
  );
}
