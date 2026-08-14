import React from 'react';
import { View, Text, Animated } from 'react-native';

interface BarData {
  stage: string;
  count: number;
  color: string;
}

interface PremiumBarChartProps {
  data: BarData[];
  title?: string;
  description?: string;
}

export function PremiumBarChart({ data, title, description }: PremiumBarChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
      {title && <Text className="text-lg font-bold text-gray-900 mb-1">{title}</Text>}
      {description && <Text className="text-gray-500 text-xs mb-5">{description}</Text>}

      <View className="flex-col gap-4">
        {data.map((item, index) => {
          const widthPercentage = Math.max((item.count / maxCount) * 100, 2); // At least 2% to show the bar

          return (
            <View key={index} className="flex-col">
              <View className="flex-row justify-between items-center mb-1.5">
                <Text className="text-sm font-semibold text-gray-700">{item.stage}</Text>
                <Text className="text-sm font-bold text-gray-900">{item.count}</Text>
              </View>
              <View className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <View
                  style={{ width: `${widthPercentage}%`, backgroundColor: item.color }}
                  className="h-full rounded-full"
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
