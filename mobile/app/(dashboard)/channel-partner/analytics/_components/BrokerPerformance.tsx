import React from "react";
import { View, Text } from "react-native";
import { SectionHeader, COLORS } from "./shared";

export function BrokerPerformance({ brokerPerformance }: { brokerPerformance: any }) {
  return (
    <>
      <SectionHeader title="Broker Performance" subtitle="Top brokers and activation." />
      <View className="bg-white rounded-3xl p-5 border border-slate-200 mb-4">
        <Text className="font-bold text-slate-900 mb-4">Top 5 Brokers</Text>
        {brokerPerformance?.topBrokers?.length > 0 ? brokerPerformance.topBrokers.slice(0, 5).map((b: any, i: number) => (
          <View key={b.id} className={`flex-row justify-between py-3 ${i !== 0 ? 'border-t border-slate-100' : ''}`}>
            <View>
              <Text className="font-semibold text-slate-800">{b.name}</Text>
              <Text className="text-xs text-slate-500">{b.smName}</Text>
            </View>
            <View className="items-end">
              <Text className="font-black text-indigo-700">{b.bookings} Bookings</Text>
              <Text className="text-xs font-bold text-emerald-700">{b.unitsSold} Units Sold</Text>
            </View>
          </View>
        )) : (
          <Text className="text-center text-slate-400 text-sm py-4">No broker booking data yet.</Text>
        )}
      </View>
      <View className="bg-white rounded-3xl p-5 border border-slate-200 mb-4">
        <Text className="font-bold text-slate-900 mb-1">Activation Rate</Text>
        <Text className="text-xs text-slate-500 mb-4">Brokers who closed at least 1 booking</Text>
        <View className="flex-row items-center gap-4">
          <Text className="text-3xl font-black text-indigo-700">{brokerPerformance?.brokerActivationRate || 0}%</Text>
          <Text className="text-sm text-slate-500 flex-1">of all brokers are currently active</Text>
        </View>
      </View>

      <View className="bg-white rounded-3xl p-5 border border-slate-200">
        <Text className="font-bold text-slate-900 mb-4">Broker Pipeline Health</Text>
        {brokerPerformance?.brokerStatusDist?.length > 0 ? (
          <View className="flex-col gap-2">
            {brokerPerformance.brokerStatusDist.map((status: any, i: number) => {
              const total = brokerPerformance.brokerStatusDist.reduce((acc: number, curr: any) => acc + (curr.value || 0), 0) || 1;
              const pct = ((status.value || 0) / total) * 100;
              return (
                <View key={status.name} className="flex-row items-center">
                  <Text className="text-xs text-slate-600 w-20">{status.name}</Text>
                  <View className="flex-1 bg-slate-100 h-2 rounded-full mx-2 overflow-hidden">
                    <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                  </View>
                  <Text className="text-xs font-bold text-slate-800 w-8 text-right">{status.value}</Text>
                </View>
              );
            })}
          </View>
        ) : <Text className="text-sm text-slate-400 text-center py-4">No status data.</Text>}
      </View>

      <View className="bg-white rounded-3xl p-5 border border-slate-200 mb-4 mt-4">
        <Text className="font-bold text-slate-900 mb-4">New Brokers Added Over Time</Text>
        {brokerPerformance?.newBrokersOverTime?.length > 0 ? (
          <View className="flex-row items-end h-32 mt-4">
            {brokerPerformance.newBrokersOverTime.map((item: any, i: number) => {
              const max = Math.max(...brokerPerformance.newBrokersOverTime.map((x: any) => x.count || 0)) || 1;
              const heightPct = ((item.count || 0) / max) * 100;
              return (
                <View key={item.month || i} className="flex-1 items-center mx-1">
                  <Text className="text-[10px] text-slate-600 mb-1">{item.count}</Text>
                  <View className="w-full bg-violet-500 rounded-t-md" style={{ height: `${heightPct}%`, minHeight: 4 }} />
                  <Text className="text-[10px] text-slate-400 mt-1 h-4" numberOfLines={1}>{item.month}</Text>
                </View>
              );
            })}
          </View>
        ) : <Text className="text-sm text-slate-400 text-center py-4">No data over time.</Text>}
      </View>
    </>
  );
}
