import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';

interface ProgressBarProps {
  percentage: number;
  label: string;
  subLabel?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  delay?: number;
}

export function PremiumProgressBar({
  percentage,
  label,
  subLabel,
  color = 'primary',
  delay = 0,
}: ProgressBarProps) {
  const colorMap = {
    primary: 'bg-indigo-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  };
  
  const bgMap = {
    primary: 'bg-indigo-100',
    success: 'bg-green-100',
    warning: 'bg-amber-100',
    danger: 'bg-red-100',
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withDelay(delay * 1000 + 300, withSpring(`${percentage}%`, { damping: 15, stiffness: 90 })),
    };
  });

  return (
    <Animated.View entering={FadeInDown.delay(delay * 1000).springify()} className="w-full mb-6">
      <View className="flex-row justify-between items-end mb-2">
        <View>
          <Text className="text-gray-900 font-bold text-base">{label}</Text>
          {subLabel && <Text className="text-gray-500 text-xs mt-0.5">{subLabel}</Text>}
        </View>
        <Text className="text-gray-900 font-extrabold text-lg">{percentage}%</Text>
      </View>

      <View className={`h-3 w-full rounded-full overflow-hidden ${bgMap[color]}`}>
        <Animated.View
          style={[
            animatedStyle,
            { height: '100%' }
          ]}
          className={`${colorMap[color]} rounded-full`}
        />
      </View>
    </Animated.View>
  );
}
