import React from "react";
import { View, Text, ScrollView } from "react-native";
import { BarChart2, CheckCircle2, Trophy, ArrowRight } from "lucide-react-native";
import { SectionHeader, COLORS } from "./shared";

export function SiteVisitAnalytics({ siteVisitAnalytics }: { siteVisitAnalytics: any }) {
  return (
    <>
      <SectionHeader title="Site Visit Analytics" subtitle="Track visit progress" />
      <View className="bg-white rounded-3xl p-5 border border-slate-200 mb-4">
        <View className="flex-col gap-3">
          {[
            { label: "Total Scheduled", value: siteVisitAnalytics?.svScheduled || 0, icon: <BarChart2 size={20} color="#64748b" />, bg: "bg-slate-50 border-slate-100" },
            { label: "Arrived at Site", value: siteVisitAnalytics?.svArrived || 0, icon: <CheckCircle2 size={20} color="#3b82f6" />, bg: "bg-blue-50 border-blue-100" },
            { label: "Completed", value: siteVisitAnalytics?.svCompleted || 0, icon: <Trophy size={20} color="#10b981" />, bg: "bg-emerald-50 border-emerald-100" },
          ].map((row, i, arr) => (
            <View key={row.label}>
              <View className={`flex-row items-center justify-between p-4 rounded-2xl border ${row.bg}`}>
                <View className="flex-row items-center">
                  {row.icon}
                  <Text className="font-semibold text-slate-700 ml-3">{row.label}</Text>
                </View>
                <Text className="text-xl font-black text-slate-900">{row.value}</Text>
              </View>
              {i < arr.length - 1 && (
                <View className="items-center my-1">
                  <ArrowRight size={16} color="#cbd5e1" style={{ transform: [{ rotate: '90deg' }] }} />
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      <View className="bg-white rounded-3xl p-5 border border-slate-200 mb-4">
        <Text className="font-bold text-slate-900 mb-4">Interest Level After Visit</Text>
        {siteVisitAnalytics?.interestLevelBreakdown?.length > 0 ? (
          <View className="flex-row items-end h-32 mt-4">
            {siteVisitAnalytics.interestLevelBreakdown.map((item: any, i: number) => {
              const max = Math.max(...siteVisitAnalytics.interestLevelBreakdown.map((x: any) => x.value || 0)) || 1;
              const heightPct = ((item.value || 0) / max) * 100;
              return (
                <View key={item.name} className="flex-1 items-center mx-1">
                  <Text className="text-[10px] text-slate-600 mb-1">{item.value}</Text>
                  <View className="w-full rounded-t-md" style={{ height: `${heightPct}%`, minHeight: 4, backgroundColor: COLORS[i % COLORS.length] }} />
                  <Text className="text-[10px] text-slate-400 mt-1 h-4" numberOfLines={1}>{item.name}</Text>
                </View>
              );
            })}
          </View>
        ) : <Text className="text-sm text-slate-400 text-center py-4">No interest data yet.</Text>}
      </View>

      <View className="bg-white rounded-3xl p-5 border border-slate-200 mb-4">
        <Text className="font-bold text-slate-900 mb-4">Site Visits Over Time</Text>
        {siteVisitAnalytics?.siteVisitsOverTime?.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {siteVisitAnalytics.siteVisitsOverTime.map((item: any, i: number) => (
              <View key={i} className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mr-3 min-w-[100px] items-center">
                <Text className="text-xs font-bold text-slate-500 mb-1">{item.month}</Text>
                <Text className="text-2xl font-black text-emerald-600">{item.count}</Text>
              </View>
            ))}
          </ScrollView>
        ) : <Text className="text-sm text-slate-400 text-center py-4">No site visits over time.</Text>}
      </View>
    </>
  );
}
