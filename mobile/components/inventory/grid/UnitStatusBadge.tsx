import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface UnitStatusBadgeProps {
  status: string;
}

export function UnitStatusBadge({ status }: UnitStatusBadgeProps) {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-700';
  let borderColor = 'border-gray-200';
  let iconName: keyof typeof Feather.glyphMap = 'help-circle';

  switch (status?.toUpperCase()) {
    case 'AVAILABLE':
      bgColor = 'bg-emerald-100';
      textColor = 'text-emerald-700';
      borderColor = 'border-emerald-200';
      iconName = 'check-circle';
      break;
    case 'RESERVED':
      bgColor = 'bg-amber-100';
      textColor = 'text-amber-700';
      borderColor = 'border-amber-200';
      iconName = 'clock';
      break;
    case 'SOLD':
      bgColor = 'bg-rose-100';
      textColor = 'text-rose-700';
      borderColor = 'border-rose-200';
      iconName = 'lock';
      break;
    case 'BLOCKED':
      bgColor = 'bg-slate-200';
      textColor = 'text-slate-700';
      borderColor = 'border-slate-300';
      iconName = 'slash';
      break;
  }

  return (
    <View className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full border ${bgColor} ${borderColor}`}>
      <Feather name={iconName} size={14} className={textColor} />
      <Text className={`text-xs font-bold ${textColor}`}>
        {status}
      </Text>
    </View>
  );
}
