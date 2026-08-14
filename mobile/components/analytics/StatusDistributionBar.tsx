import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface StatusDistributionBarProps {
  data: ChartData[];
  title: string;
  description?: string;
  delay?: number;
}

export function StatusDistributionBar({ data, title, description, delay = 0 }: StatusDistributionBarProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Animated.View entering={FadeInDown.delay(delay * 1000).springify()} className="w-full mt-6 bg-white/95 rounded-2xl p-4 shadow-sm border border-gray-100">
      <View className="mb-4">
        <Text className="text-gray-900 font-bold text-base uppercase tracking-tight">{title}</Text>
        {description && <Text className="text-gray-500 text-xs mt-0.5">{description}</Text>}
      </View>

      {total === 0 ? (
        <View className="w-full h-8 bg-gray-100 rounded-full items-center justify-center border border-gray-200 border-dashed">
          <Text className="text-xs font-bold text-gray-400">No Data</Text>
        </View>
      ) : (
        <View className="w-full h-8 flex-row rounded-full overflow-hidden">
          {data.map((item, index) => {
            const width = (item.value / total) * 100;
            if (width === 0) return null;
            
            return (
              <AnimatedBar 
                key={item.name} 
                width={width} 
                color={item.color} 
                delay={delay + (index * 0.1)} 
              />
            );
          })}
        </View>
      )}

      {total > 0 && (
        <View className="flex-row flex-wrap mt-4 justify-between">
          {data.map((item) => (
            <View key={item.name} className="flex-row items-center w-[48%] mb-2">
              <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
              <View>
                <Text className="text-xs font-semibold text-gray-700">{item.name}</Text>
                <Text className="text-[10px] font-bold text-gray-400">{item.value} ({(item.value / total * 100).toFixed(0)}%)</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

function AnimatedBar({ width, color, delay }: { width: number, color: string, delay: number }) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withDelay(delay * 1000, withSpring(`${width}%`, { damping: 15, stiffness: 90 })),
    };
  });

  return (
    <Animated.View style={[animatedStyle, { backgroundColor: color, height: '100%' }]} />
  );
}
