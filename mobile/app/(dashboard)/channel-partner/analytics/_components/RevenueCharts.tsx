import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SectionHeader, fmt } from "./shared";

export function RevenueCharts({ revenueCharts }: { revenueCharts: any }) {
  return (
    <>
      <SectionHeader title="Revenue Analytics" subtitle="Contract value vs token amount." />

      <View className="bg-white rounded-3xl p-5 border border-slate-200 mb-4">
        <Text className="font-bold text-slate-900 mb-4">Revenue Over Time</Text>
        {revenueCharts?.revenueOverTime?.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {revenueCharts.revenueOverTime.map((item: any, i: number) => (
              <View key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mr-3 min-w-[140px]">
                <Text className="text-xs font-bold text-slate-500 mb-2">{item.date}</Text>
                <View className="mb-2">
                  <Text className="text-[10px] text-slate-400">Revenue</Text>
                  <Text className="text-sm font-bold text-indigo-600">{fmt(item.revenue || 0)}</Text>
                </View>
                <View>
                  <Text className="text-[10px] text-slate-400">Token Amount</Text>
                  <Text className="text-sm font-bold text-emerald-600">{fmt(item.tokenRevenue || 0)}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : <Text className="text-sm text-slate-400 text-center py-4">No data over time.</Text>}
      </View>

      <View className="bg-white rounded-3xl p-5 border border-slate-200">
        <Text className="font-bold text-slate-900 mb-4">Project-wise Revenue</Text>
        {revenueCharts?.projectWiseRevenue?.length > 0 ? (
          revenueCharts.projectWiseRevenue.map((p: any, i: number) => {
            const maxRev = Math.max(...revenueCharts.projectWiseRevenue.map((x: any) => x.revenue || 0));
            const pct = maxRev > 0 ? (p.revenue / maxRev) * 100 : 0;
            return (
              <View key={i} className="mb-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-xs text-slate-600 font-medium">{p.name}</Text>
                  <Text className="text-xs font-bold text-slate-800">{fmt(p.revenue)}</Text>
                </View>
                <View className="bg-slate-100 h-2 rounded-full overflow-hidden">
                  <View className="bg-indigo-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                </View>
              </View>
            );
          })
        ) : <Text className="text-sm text-slate-400 text-center py-4">No revenue data.</Text>}
      </View>
    </>
  );
}
