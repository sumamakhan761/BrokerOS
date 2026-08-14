import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LeaderboardEntry } from '../misc/types';

interface MonthlyLeaderboardProps {
  leaderboard: { leaderboard: LeaderboardEntry[]; currentUserId: string } | null;
}

export default function MonthlyLeaderboard({ leaderboard }: MonthlyLeaderboardProps) {
  return (
    <View className="mb-2 mt-2">
      <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Monthly Leaderboard</Text>
      <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm shadow-slate-200/50 mb-1">
        <View className="flex-row px-1 pb-3 mb-2 border-b border-slate-100">
          <Text className="flex-1 ml-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agent</Text>
          <Text className="w-11 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Calls</Text>
          <Text className="w-11 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">F-ups</Text>
          <Text className="w-11 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visits</Text>
          <Text className="w-12 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</Text>
        </View>
        {leaderboard?.leaderboard.map((agent) => {
          const isMe = agent.userId === leaderboard.currentUserId;
          const rankEmoji = agent.rank === 1 ? '🥇' : agent.rank === 2 ? '🥈' : agent.rank === 3 ? '🥉' : `${agent.rank}`;
          
          let rowClass = "flex-row items-center py-2.5 px-1 mb-1 rounded-xl ";
          if (isMe) {
            rowClass += "bg-indigo-50 border border-indigo-200";
          } else if (agent.rank === 1) {
            rowClass += "bg-amber-100/50";
          } else if (agent.rank === 2) {
            rowClass += "bg-slate-100/50";
          } else if (agent.rank === 3) {
            rowClass += "bg-orange-50/50";
          } else {
            rowClass += "bg-transparent";
          }

          return (
            <View key={agent.userId} className={rowClass}>
              <Text className="w-8 text-sm text-center">{rankEmoji}</Text>
              <Text className={`flex-1 text-xs truncate ${isMe ? 'font-bold text-indigo-600' : 'font-medium text-slate-900'}`} numberOfLines={1}>
                {agent.name || '—'}{isMe ? ' (You)' : ''}
              </Text>
              <Text className="w-11 text-xs text-right text-slate-500 font-medium">{agent.coldCalls}</Text>
              <Text className="w-11 text-xs text-right text-slate-500 font-medium">{agent.followUps}</Text>
              <Text className="w-11 text-xs text-right text-slate-500 font-medium">{agent.siteVisits}</Text>
              <Text className="w-12 text-[13px] font-extrabold text-indigo-600 text-right">{agent.score}</Text>
            </View>
          );
        })}
        {(!leaderboard?.leaderboard || leaderboard.leaderboard.length === 0) && (
          <Text className="text-slate-400 text-sm text-center py-5 font-medium">No agents on the leaderboard yet.</Text>
        )}
      </View>
    </View>
  );
}
