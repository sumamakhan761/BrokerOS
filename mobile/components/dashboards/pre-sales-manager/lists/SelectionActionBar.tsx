import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SelectionActionBarProps {
  selectedCount: number;
  onRoundRobin: () => void;
  onAssign: () => void;
}

export function SelectionActionBar({ selectedCount, onRoundRobin, onAssign }: SelectionActionBarProps) {
  return (
    <View className="bg-blue-50 p-4 flex-row justify-between items-center border-b border-blue-100">
      <Text className="text-blue-700 font-medium">{selectedCount} Selected</Text>
      <View className="flex-row gap-2">
        <TouchableOpacity onPress={onRoundRobin} className="bg-indigo-600 px-3 py-2 rounded-lg">
          <Text className="text-white font-medium text-sm">Round Robin</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onAssign} className="bg-blue-600 px-3 py-2 rounded-lg">
          <Text className="text-white font-medium text-sm">Assign</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
