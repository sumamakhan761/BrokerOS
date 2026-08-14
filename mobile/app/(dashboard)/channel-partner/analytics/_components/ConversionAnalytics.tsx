import React from "react";
import { View, Text } from "react-native";
import { TrendingUp, Trophy } from "lucide-react-native";
import { SectionHeader } from "./shared";

export function ConversionAnalytics({ conversionRates }: { conversionRates: any }) {
  return (
    <>
      <SectionHeader title="Conversion Analytics" />
      <View className="bg-indigo-600 rounded-3xl p-6 flex-row items-center justify-between shadow-sm">
        <View>
          <View className="flex-row items-center mb-1">
            <TrendingUp size={16} color="#c7d2fe" style={{ marginRight: 6 }} />
            <Text className="text-indigo-200 font-semibold">Overall Rate</Text>
          </View>
          <Text className="text-4xl font-black text-white">{conversionRates?.overallConversionRate || 0}%</Text>
          <Text className="text-indigo-200 text-xs mt-1">Leads to Bookings</Text>
        </View>
        <Trophy size={48} color="#818cf8" opacity={0.5} />
      </View>

      <View className="bg-white rounded-3xl p-5 border border-slate-200 mt-4 mb-4">
        <Text className="font-bold text-slate-900 mb-4">Conversion Rate by Project</Text>
        {conversionRates?.conversionByProject?.length > 0 ? (
          <View className="flex-col gap-4">
            {conversionRates.conversionByProject.map((item: any) => {
              const total = Math.max(item.leads || 1, item.bookings || 0);
              const leadWidth = ((item.leads || 0) / total) * 100;
              const bookingWidth = ((item.bookings || 0) / total) * 100;
              return (
                <View key={item.name}>
                  <Text className="text-xs font-semibold text-slate-700 mb-1">{item.name}</Text>
                  <View className="flex-col gap-1">
                    <View className="flex-row items-center">
                      <View className="bg-slate-300 h-2 rounded-r-md" style={{ width: `${leadWidth}%`, minWidth: 2 }} />
                      <Text className="text-[10px] text-slate-500 ml-2">{item.leads} Leads</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="bg-indigo-500 h-2 rounded-r-md" style={{ width: `${bookingWidth}%`, minWidth: 2 }} />
                      <Text className="text-[10px] text-indigo-600 ml-2 font-bold">{item.bookings} Bookings</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : <Text className="text-sm text-slate-400 text-center py-4">No conversion data per project.</Text>}
      </View>
    </>
  );
}
