import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export function DailyActivityHeatmap({ activityData }: { activityData: any[] }) {
  const [mode, setMode] = useState<'siteVisits' | 'followUps'>('siteVisits');

  if (!activityData) return null;

  // Generate last 90 days grid
  const days = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  const activityMap = new Map();
  activityData.forEach(d => {
    activityMap.set(d.date, d);
  });

  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-100';
    
    if (mode === 'siteVisits') {
      if (count === 1) return 'bg-emerald-200';
      if (count === 2) return 'bg-emerald-400';
      if (count >= 3) return 'bg-emerald-600';
    } else {
      if (count <= 2) return 'bg-blue-200';
      if (count <= 5) return 'bg-blue-400';
      if (count > 5) return 'bg-blue-600';
    }
    return 'bg-slate-100';
  };

  // Group into columns of 7 (weeks)
  const columns = [];
  for (let i = 0; i < days.length; i += 7) {
    columns.push(days.slice(i, i + 7));
  }

  return (
    <View className="px-6 mb-8">
      <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-lg font-bold text-slate-800">Daily Consistency</Text>
        </View>

        <View className="flex-row gap-2 bg-slate-50 p-1 rounded-lg mb-6 self-start">
          <TouchableOpacity
            onPress={() => setMode('siteVisits')}
            className={`px-3 py-1.5 rounded-md ${mode === 'siteVisits' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`text-xs font-bold ${mode === 'siteVisits' ? 'text-emerald-600' : 'text-slate-500'}`}>Site Visits</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('followUps')}
            className={`px-3 py-1.5 rounded-md ${mode === 'followUps' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`text-xs font-bold ${mode === 'followUps' ? 'text-blue-600' : 'text-slate-500'}`}>Follow-ups</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-[4px] pr-4">
            {columns.map((col, colIdx) => (
              <View key={colIdx} className="gap-[4px]">
                {col.map(day => {
                  const data = activityMap.get(day);
                  const count = data ? data[mode] : 0;
                  return (
                    <View
                      key={day}
                      className={`w-[14px] h-[14px] rounded-[2px] ${getColor(count)}`}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
        
        <View className="flex-row justify-end items-center gap-2 mt-4">
          <Text className="text-[10px] font-medium text-slate-500">Less</Text>
          <View className="flex-row gap-1">
            <View className="w-2.5 h-2.5 rounded-[2px] bg-slate-100" />
            <View className={`w-2.5 h-2.5 rounded-[2px] ${mode === 'siteVisits' ? 'bg-emerald-200' : 'bg-blue-200'}`} />
            <View className={`w-2.5 h-2.5 rounded-[2px] ${mode === 'siteVisits' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
            <View className={`w-2.5 h-2.5 rounded-[2px] ${mode === 'siteVisits' ? 'bg-emerald-600' : 'bg-blue-600'}`} />
          </View>
          <Text className="text-[10px] font-medium text-slate-500">More</Text>
        </View>
      </View>
    </View>
  );
}
