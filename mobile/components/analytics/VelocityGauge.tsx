import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';

interface VelocityGaugeProps {
  days: number;
  label?: string;
  subLabel?: string;
  maxDays?: number;
  delay?: number;
}

export function VelocityGauge({
  days,
  label = "Average Velocity",
  subLabel = "Booking to Handover",
  maxDays = 120,
  delay = 0,
}: VelocityGaugeProps) {
  
  const percentage = Math.min((days / maxDays) * 100, 100);
  
  const isFast = days <= 30;
  const isMedium = days > 30 && days <= 60;
  
  const bgClass = isFast ? 'bg-green-100' : isMedium ? 'bg-amber-100' : 'bg-red-100';
  const fillClass = isFast ? 'bg-green-500' : isMedium ? 'bg-amber-500' : 'bg-red-500';
  const textClass = isFast ? 'text-green-600' : isMedium ? 'text-amber-600' : 'text-red-600';

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withDelay(delay * 1000 + 300, withSpring(`${percentage}%`, { damping: 15, stiffness: 90 })),
    };
  });

  return (
    <Animated.View entering={FadeInDown.delay(delay * 1000).springify()} className="w-full mt-6 bg-white/95 rounded-2xl p-4 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-end mb-4">
        <View>
          <Text className="text-gray-900 font-bold text-base uppercase tracking-tight">{label}</Text>
          {subLabel && <Text className="text-gray-500 text-xs mt-0.5">{subLabel}</Text>}
        </View>
        <View className="items-end">
          <Text className={`font-black text-2xl ${textClass}`}>{days}</Text>
          <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Days</Text>
        </View>
      </View>

      <View className={`h-4 w-full rounded-full overflow-hidden ${bgClass}`}>
        <Animated.View
          style={[
            animatedStyle,
            { height: '100%' }
          ]}
          className={`${fillClass} rounded-full`}
        />
      </View>
      
      <View className="flex-row justify-between mt-2">
        <Text className="text-[10px] text-gray-400 font-bold uppercase">0 Days</Text>
        <Text className="text-[10px] text-gray-400 font-bold uppercase">{maxDays}+ Days</Text>
      </View>
    </Animated.View>
  );
}
