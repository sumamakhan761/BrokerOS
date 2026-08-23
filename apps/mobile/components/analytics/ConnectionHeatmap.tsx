import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';

interface HeatmapData {
  day: number;
  hour: number;
  count: number;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function ConnectionHeatmap({ data }: { data: HeatmapData[] }) {
  const maxCount = useMemo(() => {
    return Math.max(...data.map(d => d.count), 1);
  }, [data]);

  const getColor = (count: number) => {
    if (count === 0) return '#f1f5f9';
    const intensity = count / maxCount;
    if (intensity < 0.2) return '#bbf7d0';
    if (intensity < 0.4) return '#86efac';
    if (intensity < 0.6) return '#4ade80';
    if (intensity < 0.8) return '#22c55e';
    return '#16a34a';
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="min-w-[600px] flex-col">
        <View className="flex-row mb-1">
          <View className="w-10 shrink-0"></View>
          {HOURS.map(hour => (
            <View key={hour} className="flex-1 items-center">
              <Text className="text-[9px] text-gray-400 font-medium">{hour % 12 === 0 ? 12 : hour % 12}{hour >= 12 ? 'p' : 'a'}</Text>
            </View>
          ))}
        </View>

        <View className="flex-col gap-1">
          {DAYS.map((dayName, dayIdx) => (
            <View key={dayName} className="flex-row items-center gap-1">
              <Text className="w-10 shrink-0 text-[10px] font-semibold text-gray-500">{dayName}</Text>
              {HOURS.map(hour => {
                const cellData = data.find(d => d.day === dayIdx && d.hour === hour) || { count: 0 };
                return (
                  <View
                    key={hour}
                    className="flex-1 h-5 rounded-sm"
                    style={{ backgroundColor: getColor(cellData.count) }}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
