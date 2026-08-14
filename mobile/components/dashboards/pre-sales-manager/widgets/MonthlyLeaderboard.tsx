import React from 'react';
import { View, Text } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Trophy } from 'lucide-react-native';

export function MonthlyLeaderboard({ leaderboard }: { leaderboard: any[] }) {
  return (
    <View className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
      <View className="flex-row items-center gap-2 mb-4">
        <View className="bg-amber-50 p-2 rounded-lg">
          <Trophy size={20} className="text-amber-500" />
        </View>
        <Text className="text-sm font-bold text-slate-500 uppercase tracking-wider">Team Monthly Leaderboard</Text>
      </View>

      <View className="flex-row pb-2.5 border-b border-slate-100 px-2">
        <Text className="w-8 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rank</Text>
        <Text className="flex-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agent</Text>
        <Text className="w-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Calls</Text>
        <Text className="w-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">F-ups</Text>
        <Text className="w-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Visits</Text>
        <Text className="w-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Score</Text>
      </View>

      {(!leaderboard || leaderboard.length === 0) ? (
        <View className="py-6 items-center">
          <Text className="text-slate-400 font-medium text-sm">No agents yet.</Text>
        </View>
      ) : (
        <View className="gap-2 mt-2">
          {leaderboard.map((agent: any) => {
            const emoji = agent.rank === 1 ? '🥇' : agent.rank === 2 ? '🥈' : agent.rank === 3 ? '🥉' : `${agent.rank}`;
            const bgClass = agent.rank === 1 ? 'bg-amber-50/60' : agent.rank === 2 ? 'bg-slate-50/60' : agent.rank === 3 ? 'bg-orange-50/40' : 'bg-white hover:bg-slate-50/50';
            return (
              <View key={agent.userId} className={`flex-row items-center py-2 px-2 rounded-xl ${bgClass}`}>
                <Text className="w-8 text-sm font-bold text-slate-700">{emoji}</Text>
                <View className="flex-1 flex-row items-center gap-2">
                  <Avatar name={agent.name} size={24} />
                  <Text className="text-xs font-semibold text-slate-900" numberOfLines={1}>{agent.name || '—'}</Text>
                </View>
                <Text className="w-12 text-[11px] font-semibold text-slate-500 text-right">{agent.coldCalls}</Text>
                <Text className="w-12 text-[11px] font-semibold text-slate-500 text-right">{agent.followUps}</Text>
                <Text className="w-12 text-[11px] font-semibold text-slate-500 text-right">{agent.siteVisits}</Text>
                <Text className="w-12 text-[11px] font-extrabold text-slate-900 text-right">{agent.score}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
