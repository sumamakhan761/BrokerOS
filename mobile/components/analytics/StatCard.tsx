import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Feather.glyphMap;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  delay?: number;
}

export function StatCard({ title, value, subtitle, icon, trend, trendValue, delay = 0 }: StatCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay(delay * 1000).springify()} className="w-[48%]">
      <View className="bg-white/95 rounded-2xl p-3 shadow-sm border border-gray-100 mb-3 flex-col justify-between items-start">
        <View className="flex-row w-full justify-between items-start mb-2">
          <View className="p-2 rounded-xl bg-indigo-50 border border-indigo-100/50">
            <Feather name={icon} size={16} color="#6366f1" />
          </View>
        </View>

        <View className="w-full">
          <Text className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">{title}</Text>
          <Text className="text-xl font-extrabold text-gray-900">{value}</Text>
          
          {subtitle && (
            <Text className="text-gray-400 text-[9px] mt-0.5">{subtitle}</Text>
          )}

          {trend && trendValue && (
            <View className="flex-row items-center mt-2 bg-gray-50 self-start px-1.5 py-0.5 rounded border border-gray-100">
              <Text
                className={`text-[9px] font-bold ${
                  trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}
              >
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}
