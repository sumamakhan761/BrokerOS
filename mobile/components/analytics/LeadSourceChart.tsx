import React from 'react';
import { View, Text } from 'react-native';

interface SourceData {
  source: string;
  count: number;
}

export function LeadSourceChart({ data }: { data: SourceData[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const colors = ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316', '#eab308'];

  return (
    <View className="flex-col gap-3">
      {data.map((item, index) => {
        const widthPct = Math.max((item.count / maxCount) * 100, 2);
        const color = colors[index % colors.length];
        return (
          <View key={index} className="flex-row items-center">
            <Text className="w-24 text-xs font-semibold text-gray-700" numberOfLines={1}>{item.source}</Text>
            <View className="flex-1 flex-row items-center ml-2">
              <View className="h-2 rounded-full" style={{ width: `${widthPct}%`, backgroundColor: color }} />
              <Text className="ml-2 text-xs font-bold text-gray-900">{item.count}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
