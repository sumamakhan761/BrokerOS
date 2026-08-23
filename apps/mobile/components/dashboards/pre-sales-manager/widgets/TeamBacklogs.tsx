import React from 'react';
import { View, Text } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { AlertCircle, Clock } from 'lucide-react-native';

interface Backlog {
  id: string;
  name: string;
  missedFollowUps: number;
  untouchedLeads: number;
}

export function TeamBacklogs({ backlogs }: { backlogs: Backlog[] }) {
  return (
    <View className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
      <View className="flex-row items-center gap-2 mb-4">
        <View className="bg-rose-50 p-2 rounded-lg">
          <AlertCircle size={20} className="text-rose-600" />
        </View>
        <Text className="text-sm font-bold text-slate-500 uppercase tracking-wider">Team Backlogs</Text>
      </View>
      {backlogs.length === 0 ? (
        <View className="py-6 items-center">
          <Text className="text-slate-400 font-medium text-sm">No employees found.</Text>
        </View>
      ) : (
        <View className="gap-3">
          {backlogs.map(agent => (
            <View key={agent.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <View className="flex-row items-center gap-3 mb-2">
                <Avatar name={agent.name} size={32} />
                <Text className="text-sm font-bold text-slate-900">{agent.name}</Text>
              </View>
              <View className="flex-row gap-2">
                <View className="bg-rose-100/50 px-2.5 py-1 rounded-full flex-row items-center gap-1">
                  <AlertCircle size={10} className="text-rose-700" />
                  <Text className="text-rose-700 text-[10px] font-bold uppercase tracking-wider">{agent.missedFollowUps} Missed F-ups</Text>
                </View>
                <View className="bg-amber-100/50 px-2.5 py-1 rounded-full flex-row items-center gap-1">
                  <Clock size={10} className="text-amber-700" />
                  <Text className="text-amber-700 text-[10px] font-bold uppercase tracking-wider">{agent.untouchedLeads} Untouched Leads</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
