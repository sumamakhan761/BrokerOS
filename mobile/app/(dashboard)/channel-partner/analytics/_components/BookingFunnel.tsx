import React from "react";
import { View, Text } from "react-native";
import { CheckCircle2, FileText, ShieldCheck, Key, Home, ArrowRight } from "lucide-react-native";
import { SectionHeader } from "./shared";

export function BookingFunnel({ bookingFunnel }: { bookingFunnel: any }) {
  return (
    <>
      <SectionHeader title="Booking Pipeline" subtitle="Cumulative progress funnel." />
      <View className="bg-white rounded-3xl p-5 border border-slate-200">
        {[
          { label: "Confirmed", value: bookingFunnel.confirmed, icon: <CheckCircle2 size={20} color="#64748b" />, bg: "bg-slate-50 border-slate-100" },
          { label: "Docs & Beyond", value: bookingFunnel.documentation, icon: <FileText size={20} color="#3b82f6" />, bg: "bg-blue-50 border-blue-100" },
          { label: "Loan/Agr. & Beyond", value: bookingFunnel.loanAgreement, icon: <ShieldCheck size={20} color="#6366f1" />, bg: "bg-indigo-50 border-indigo-100" },
          { label: "Possession & Beyond", value: bookingFunnel.possession, icon: <Key size={20} color="#f59e0b" />, bg: "bg-amber-50 border-amber-100" },
          { label: "Handover Done", value: bookingFunnel.handover, icon: <Home size={20} color="#10b981" />, bg: "bg-emerald-50 border-emerald-100" },
        ].map((stage, i, arr) => (
          <View key={stage.label}>
            <View className={`flex-row items-center justify-between p-4 rounded-2xl border ${stage.bg}`}>
              <View className="flex-row items-center">
                {stage.icon}
                <Text className="font-semibold text-slate-700 ml-3">{stage.label}</Text>
              </View>
              <Text className="text-xl font-black text-slate-900">{stage.value}</Text>
            </View>
            {i < arr.length - 1 && (
              <View className="items-center my-1">
                <ArrowRight size={16} color="#cbd5e1" style={{ transform: [{ rotate: '90deg' }] }} />
              </View>
            )}
          </View>
        ))}
      </View>
    </>
  );
}
