import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';

export interface ProjectPerformanceData {
  projectName: string;
  activePostSales: number;
  handovers: number;
}

interface ProjectPerformanceChartProps {
  data: ProjectPerformanceData[];
  delay?: number;
}

export function ProjectPerformanceChart({ data, delay = 0 }: ProjectPerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <Animated.View entering={FadeInDown.delay(delay * 1000).springify()} className="w-full mt-6 bg-white/95 rounded-2xl p-4 shadow-sm border border-gray-100">
        <View className="mb-4">
          <Text className="text-gray-900 font-bold text-base uppercase tracking-tight">Project Performance</Text>
          <Text className="text-gray-500 text-xs mt-0.5">Active Post-Sales vs Handovers</Text>
        </View>
        <View className="w-full h-16 bg-gray-100 rounded-xl items-center justify-center border border-gray-200 border-dashed">
          <Text className="text-xs font-bold text-gray-400">No project data available.</Text>
        </View>
      </Animated.View>
    );
  }

  // Find max total to normalize the bars
  const maxTotal = Math.max(...data.map(d => d.activePostSales + d.handovers));

  return (
    <Animated.View entering={FadeInDown.delay(delay * 1000).springify()} className="w-full mt-6 bg-white/95 rounded-2xl p-4 shadow-sm border border-gray-100">
      <View className="mb-4">
        <Text className="text-gray-900 font-bold text-base uppercase tracking-tight">Project Performance</Text>
        <Text className="text-gray-500 text-xs mt-0.5">Active Post-Sales vs Handovers</Text>
      </View>

      <View className="flex-col gap-y-4 w-full">
        {data.map((item, index) => {
          const total = item.activePostSales + item.handovers;
          const activePercent = total > 0 ? (item.activePostSales / total) * 100 : 0;
          const handoverPercent = total > 0 ? (item.handovers / total) * 100 : 0;

          // Overall width of the bar relative to the max project
          const overallWidth = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

          return (
            <View key={item.projectName} className="w-full">
              <View className="flex-row justify-between items-end mb-1">
                <Text className="text-xs font-bold text-gray-700">{item.projectName}</Text>
                <Text className="text-[10px] font-semibold text-gray-400">Total: {total}</Text>
              </View>
              <View className="w-full h-4 bg-gray-100 rounded-full flex-row overflow-hidden border border-gray-200">
                <View style={{ width: `${overallWidth}%` }} className="h-full flex-row">
                  <AnimatedSegment width={activePercent} color="#6366f1" delay={delay + (index * 0.1)} />
                  <AnimatedSegment width={handoverPercent} color="#10b981" delay={delay + (index * 0.1) + 0.1} />
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View className="flex-row mt-6 pt-4 border-t border-gray-100 justify-center">
        <View className="flex-row items-center mr-6">
          <View className="w-3 h-3 rounded-full bg-indigo-500 mr-2" />
          <Text className="text-[10px] font-bold text-gray-600 uppercase">Active Post-Sales</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
          <Text className="text-[10px] font-bold text-gray-600 uppercase">Handovers</Text>
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
