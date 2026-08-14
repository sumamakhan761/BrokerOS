import React from "react";
import { View, Text } from "react-native";
import { Lock } from "lucide-react-native";
import { SectionHeader, fmt } from "./shared";

export function BrokerageSettlement({ brokerageSettlement }: { brokerageSettlement: any }) {
  return (
    <>
      <SectionHeader title="Brokerage Settlement" />
      <View className="bg-white rounded-3xl p-5 border border-slate-200 opacity-60 relative overflow-hidden">
        <View className="absolute inset-0 z-10 items-center justify-center bg-white/70 rounded-3xl flex-col">
          <Lock size={32} color="#94a3b8" className="mb-2" />
          <Text className="text-xl font-black text-slate-600">Coming Soon</Text>
        </View>
        <View className="bg-amber-50 rounded-xl p-4 mb-3 border border-amber-100">
          <Text className="text-xs font-bold text-amber-700">Pending</Text>
          <Text className="text-xl font-black text-amber-900">{fmt(brokerageSettlement?.pendingAmount || 0)}</Text>
        </View>
        <View className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <Text className="text-xs font-bold text-emerald-700">Paid</Text>
          <Text className="text-xl font-black text-emerald-900">{fmt(brokerageSettlement?.paidAmount || 0)}</Text>
        </View>
      </View>
    </>
  );
}
