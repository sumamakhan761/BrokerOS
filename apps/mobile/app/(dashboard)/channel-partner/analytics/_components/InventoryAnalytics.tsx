import React from "react";
import { View, Text } from "react-native";
import { SectionHeader, COLORS } from "./shared";

export function InventoryAnalytics({ inventoryAnalytics }: { inventoryAnalytics: any }) {
  return (
    <>
      <SectionHeader title="Inventory Analytics" subtitle="Availability and absorption rates." />

      <View className="bg-white rounded-3xl p-5 border border-slate-200 mb-4">
        <Text className="font-bold text-slate-900 mb-4">Inventory Status by Project</Text>
        {inventoryAnalytics?.inventoryPerProject?.length > 0 ? inventoryAnalytics.inventoryPerProject.map((p: any, i: number) => {
          const total = (p.available || 0) + (p.reserved || 0) + (p.sold || 0) + (p.blocked || 0) || 1;
          return (
            <View key={p.name} className={`py-3 ${i !== 0 ? 'border-t border-slate-50' : ''}`}>
              <Text className="text-xs font-semibold text-slate-700 mb-2">{p.name}</Text>
              <View className="flex-row h-2 rounded-full overflow-hidden bg-slate-100">
                <View style={{ width: `${(p.available / total) * 100}%` }} className="bg-emerald-500" />
                <View style={{ width: `${(p.reserved / total) * 100}%` }} className="bg-amber-500" />
                <View style={{ width: `${(p.sold / total) * 100}%` }} className="bg-indigo-500" />
                <View style={{ width: `${(p.blocked / total) * 100}%` }} className="bg-red-500" />
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className="text-[10px] text-emerald-600">Avail: {p.available || 0}</Text>
                <Text className="text-[10px] text-amber-600">Resv: {p.reserved || 0}</Text>
                <Text className="text-[10px] text-indigo-600">Sold: {p.sold || 0}</Text>
                <Text className="text-[10px] text-red-600">Blk: {p.blocked || 0}</Text>
              </View>
            </View>
          );
        }) : <Text className="text-sm text-slate-400 text-center py-4">No inventory status data.</Text>}
      </View>

      <View className="bg-white rounded-3xl p-5 border border-slate-200 mb-4">
        <Text className="font-bold text-slate-900 mb-4">Unit Type Breakdown (Sold)</Text>
        {inventoryAnalytics?.unitTypeBreakdown?.length > 0 ? (
          <View className="flex-row flex-wrap">
            {inventoryAnalytics.unitTypeBreakdown.map((type: any, i: number) => (
              <View key={type.name} className="bg-slate-50 border border-slate-100 rounded-lg py-2 px-3 m-1 flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <Text className="text-sm font-semibold text-slate-700">{type.name}</Text>
                <Text className="text-sm font-bold text-slate-900 ml-1">{type.value}</Text>
              </View>
            ))}
          </View>
        ) : <Text className="text-sm text-slate-400 text-center py-4">No sold units yet.</Text>}
      </View>

      <View className="bg-white rounded-3xl p-5 border border-slate-200">
        <Text className="font-bold text-slate-900 mb-4">Absorption Rate by Project</Text>
        {inventoryAnalytics?.inventoryPerProject?.length > 0 ? inventoryAnalytics.inventoryPerProject.map((p: any, i: number) => (
          <View key={p.name} className={`flex-row items-center py-2 ${i !== 0 ? 'border-t border-slate-50' : ''}`}>
            <Text className="text-xs text-slate-600 w-24 font-medium" numberOfLines={1}>{p.name}</Text>
            <View className="flex-1 bg-slate-100 rounded-full h-2 mx-3 overflow-hidden">
              <View className="h-full rounded-full bg-indigo-500" style={{ width: `${p.absorptionRate}%` }} />
            </View>
            <Text className="text-xs font-bold text-slate-800 w-10 text-right">{p.absorptionRate}%</Text>
          </View>
        )) : <Text className="text-sm text-slate-400 text-center py-4">No inventory data.</Text>}
      </View>
    </>
  );
}
