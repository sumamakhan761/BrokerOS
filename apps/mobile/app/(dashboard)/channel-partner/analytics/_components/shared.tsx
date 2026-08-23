import React from "react";
import { View, Text } from "react-native";

export const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export const Widget = ({ icon, label, value, sub, accent = "indigo", dark = false }: any) => {
  const accents: Record<string, string> = {
    indigo: "bg-indigo-100",
    emerald: "bg-emerald-100",
    amber: "bg-amber-100",
    rose: "bg-rose-100",
    violet: "bg-violet-100",
    sky: "bg-sky-100",
    orange: "bg-orange-100",
    slate: "bg-slate-100",
    teal: "bg-teal-100",
    purple: "bg-purple-100",
  };

  const textAccents: Record<string, string> = {
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
    violet: "text-violet-600",
    sky: "text-sky-600",
    orange: "text-orange-600",
    slate: "text-slate-600",
    teal: "text-teal-600",
    purple: "text-purple-600",
  };

  return (
    <View className={`rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex-1 m-1 min-w-[150px] ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
      <View className="flex flex-col gap-3 relative z-10">
        <View className={`w-10 h-10 rounded-xl flex items-center justify-center ${accents[accent]}`}>
          {icon}
        </View>
        <View>
          <Text className={`text-xs font-bold mb-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</Text>
          <Text className={`text-2xl font-black ${dark ? 'text-white' : 'text-slate-900'}`}>{value}</Text>
          {sub && <Text className="text-xs text-slate-400 mt-0.5">{sub}</Text>}
        </View>
      </View>
    </View>
  );
};

export const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <View className="mb-4 mt-6">
    <Text className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</Text>
    {subtitle && <Text className="text-sm text-slate-500 mt-0.5">{subtitle}</Text>}
  </View>
);
