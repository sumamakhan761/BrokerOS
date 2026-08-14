import React from 'react';
import { View, Text } from 'react-native';

export function ConversionFunnel({ funnelData }: { funnelData: any }) {
  if (!funnelData) return null;

  const total = funnelData.leads || 1; // Prevent division by zero
  
  const stages = [
    { label: 'Total Leads', value: funnelData.leads || 0, color: 'bg-slate-200', width: 100 },
    { label: 'Site Visits', value: funnelData.siteVisits || 0, color: 'bg-blue-300', width: Math.max((funnelData.siteVisits / total) * 100, 5) },
    { label: 'Negotiations', value: funnelData.negotiations || 0, color: 'bg-purple-400', width: Math.max((funnelData.negotiations / total) * 100, 5) },
    { label: 'Reserved', value: funnelData.reserved || 0, color: 'bg-yellow-300', width: Math.max((funnelData.reserved / total) * 100, 5) },
    { label: 'Sold', value: funnelData.sold || 0, color: 'bg-emerald-500', width: Math.max((funnelData.sold / total) * 100, 5) }
  ];

  return (
    <View className="px-6 mb-8">
      <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <View className="flex-row justify-between items-start mb-6">
          <Text className="text-lg font-bold text-slate-800">Conversion Pipeline</Text>
          <View className="items-end">
            <Text className="text-2xl font-black text-indigo-600 leading-tight">
              {funnelData.conversionRate || "0.0"}%
            </Text>
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Win Rate</Text>
          </View>
        </View>

        <View className="gap-3">
          {stages.map((stage, idx) => (
            <View key={idx} className="flex-row items-center">
              <View className="w-24">
                <Text className="text-xs font-bold text-slate-500">{stage.label}</Text>
              </View>
              <View className="flex-1 h-8 bg-slate-50 rounded-r-lg justify-center relative overflow-hidden">
                <View 
                  className={`absolute top-0 bottom-0 left-0 rounded-r-lg ${stage.color}`} 
                  style={{ width: `${stage.width}%` }} 
                />
                <Text className="absolute left-3 text-xs font-black text-slate-800 z-10">
                  {stage.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
