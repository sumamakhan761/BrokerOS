import React from "react";
import { View, Text } from "react-native";
import { SectionHeader } from "./shared";

export function CMLeaderboard({ cmLeaderboard }: { cmLeaderboard: any }) {
  return (
    <>
      <SectionHeader title="CM Leaderboard" subtitle="Closing Managers Pipeline" />
      <View className="bg-white rounded-3xl p-5 border border-slate-200">
        {cmLeaderboard?.table?.length > 0 ? [...cmLeaderboard.table].sort((a: any, b: any) => b.bookingsClosed - a.bookingsClosed).slice(0, 5).map((cm: any, i: number) => (
          <View key={cm.id} className={`flex-row justify-between py-3 ${i !== 0 ? 'border-t border-slate-100' : ''}`}>
            <View>
              <Text className="font-semibold text-slate-800">{cm.name}</Text>
              <Text className="text-xs text-slate-500">{cm.projectsAssigned} Projects</Text>
            </View>
            <View className="items-end">
              <Text className="font-black text-indigo-700">{cm.bookingsClosed} Closed</Text>
              <Text className="text-xs font-bold text-emerald-700">{cm.handoversDone} Handovers</Text>
            </View>
          </View>
        )) : <Text className="text-slate-400 text-center py-4">No closing managers yet.</Text>}
      </View>
    </>
  );
}
