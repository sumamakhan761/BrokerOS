import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';

export interface InventorySellThroughData {
  projectName: string;
  totalUnits: number;
  soldUnits: number;
}

interface InventorySellThroughChartProps {
  data: InventorySellThroughData[];
  delay?: number;
}

export function InventorySellThroughChart({ data, delay = 0 }: InventorySellThroughChartProps) {
  if (!data || data.length === 0) {
    return (
      <Animated.View entering={FadeInDown.delay(delay * 1000).springify()} className="w-full mt-6 bg-white/95 rounded-2xl p-4 shadow-sm border border-gray-100">
        <View className="mb-4">
          <Text className="text-gray-900 font-bold text-base uppercase tracking-tight">Inventory Sell-Through</Text>
          <Text className="text-gray-500 text-xs mt-0.5">Sold vs Available Units</Text>
        </View>
        <View className="w-full h-16 bg-gray-100 rounded-xl items-center justify-center border border-gray-200 border-dashed">
          <Text className="text-xs font-bold text-gray-400">No inventory data available.</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.delay(delay * 1000).springify()} className="w-full mt-6 bg-white/95 rounded-2xl p-4 shadow-sm border border-gray-100">
      <View className="mb-4">
        <Text className="text-gray-900 font-bold text-base uppercase tracking-tight">Inventory Sell-Through</Text>
        <Text className="text-gray-500 text-xs mt-0.5">Sold vs Available Units across internal projects</Text>
      </View>

      <View className="flex-col gap-y-4 w-full">
        {data.map((item, index) => {
          const soldPercent = item.totalUnits > 0 ? (item.soldUnits / item.totalUnits) * 100 : 0;
          const availablePercent = item.totalUnits > 0 ? ((item.totalUnits - item.soldUnits) / item.totalUnits) * 100 : 0;

          return (
            <View key={item.projectName} className="w-full">
              <View className="flex-row justify-between items-end mb-1">
                <Text className="text-xs font-bold text-gray-700">{item.projectName}</Text>
                <Text className="text-[10px] font-semibold text-gray-400">Total: {item.totalUnits}</Text>
              </View>
              <View className="w-full h-4 bg-gray-200 rounded-full flex-row overflow-hidden border border-gray-300">
                <AnimatedSegment width={soldPercent} color="#10b981" delay={delay + (index * 0.1)} />
                <AnimatedSegment width={availablePercent} color="#cbd5e1" delay={delay + (index * 0.1) + 0.1} />
              </View>
            </View>
          );
        })}
      </View>

      <View className="flex-row mt-6 pt-4 border-t border-gray-100 justify-center">
        <View className="flex-row items-center mr-6">
          <View className="w-3 h-3 rounded-full bg-emerald-500 mr-2" />
          <Text className="text-[10px] font-bold text-gray-600 uppercase">Sold/Reserved</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-slate-300 mr-2" />
          <Text className="text-[10px] font-bold text-gray-600 uppercase">Available</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function AnimatedSegment({ width, color, delay }: { width: number, color: string, delay: number }) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withDelay(delay * 1000, withSpring(`${width}%`, { damping: 15, stiffness: 90 })),
    };
  });

  return (
    <Animated.View style={[animatedStyle, { backgroundColor: color, height: '100%' }]} />
  );
}
