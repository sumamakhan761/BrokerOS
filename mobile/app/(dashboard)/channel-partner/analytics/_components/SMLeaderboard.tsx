import React from "react";
import { View, Text } from "react-native";
import { SectionHeader } from "./shared";

export function SMLeaderboard({ smLeaderboard }: { smLeaderboard: any }) {
  return (
    <>
      <SectionHeader title="SM Leaderboard" subtitle="Top Sourcing Managers" />
      <View className="bg-white rounded-3xl p-5 border border-slate-200">
        {smLeaderboard?.table?.length > 0 ? [...smLeaderboard.table].sort((a: any, b: any) => b.bookingsVia - a.bookingsVia).slice(0, 5).map((sm: any, i: number) => (
          <View key={sm.id} className={`flex-row justify-between py-3 ${i !== 0 ? 'border-t border-slate-100' : ''}`}>
            <View>
              <Text className="font-semibold text-slate-800">{sm.name}</Text>
              <Text className="text-xs text-slate-500">{sm.activeBrokers} Active Brokers</Text>
            </View>
            <View className="items-end">
              <Text className="font-black text-indigo-700">{sm.bookingsVia} Bookings</Text>
            </View>
          </View>
        )) : <Text className="text-slate-400 text-center py-4">No SM data yet.</Text>}
      </View>

      <View className="bg-white rounded-3xl p-5 border border-slate-200 mb-4 mt-4">
        <Text className="font-bold text-slate-900 mb-4">SM Contribution (Bookings)</Text>
        {smLeaderboard?.contributionChart?.length > 0 ? (
          <View className="flex-col gap-3">
            {smLeaderboard.contributionChart.map((item: any, i: number) => {
              const max = Math.max(...smLeaderboard.contributionChart.map((x: any) => x.bookings || 0)) || 1;
              const widthPct = ((item.bookings || 0) / max) * 100;
              return (
                <View key={item.name} className="flex-row items-center">
                  <Text className="text-xs text-slate-600 w-24 font-medium" numberOfLines={1}>{item.name}</Text>
                  <View className="flex-1 bg-slate-100 rounded-full h-2 mx-2 overflow-hidden">
                    <View className="h-full rounded-full bg-indigo-500" style={{ width: `${widthPct}%` }} />
                  </View>
                  <Text className="text-xs font-bold text-slate-800 w-8 text-right">{item.bookings}</Text>
                </View>
              );
            })}
          </View>
        ) : <Text className="text-sm text-slate-400 text-center py-4">No contribution data.</Text>}
      </View>
    </>
  );
}
