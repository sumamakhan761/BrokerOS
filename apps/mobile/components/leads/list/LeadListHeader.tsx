import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface LeadListHeaderProps {
  selectionMode: boolean;
  setSelectionMode: (mode: boolean) => void;
  clearSelection: () => void;
  title?: string;
}

export default function LeadListHeader({ selectionMode, setSelectionMode, clearSelection, title = "Leads" }: LeadListHeaderProps) {
  return (
    <View className="p-4 bg-white border-b border-gray-200 shadow-sm flex-row items-center justify-between z-10 pt-12">
      <Text className="text-xl font-bold text-gray-900">{title}</Text>
      <TouchableOpacity
        onPress={() => {
          if (selectionMode) {
            setSelectionMode(false);
            clearSelection();
          } else {
            setSelectionMode(true);
          }
        }}
        className={`px-3 py-1.5 rounded-lg border ${selectionMode ? 'bg-gray-100 border-gray-300' : 'bg-blue-50 border-blue-200'}`}
      >
        <Text className={selectionMode ? 'text-gray-700 font-medium' : 'text-blue-700 font-medium'}>
          {selectionMode ? 'Cancel' : 'Select'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
