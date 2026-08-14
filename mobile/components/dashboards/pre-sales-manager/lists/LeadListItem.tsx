import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
}

interface LeadListItemProps {
  item: Lead;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

export function LeadListItem({ item, isSelected, onToggleSelect }: LeadListItemProps) {
  return (
    <TouchableOpacity
      onPress={() => onToggleSelect(item.id)}
      className={`bg-white p-4 mb-3 rounded-xl border ${isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100'}`}
      style={!isSelected ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 } : {}}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center gap-3">
          <View className={`w-5 h-5 rounded-md border items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
            {isSelected && <Feather name="check" size={14} color="white" />}
          </View>
          <View>
            <Text className="text-lg font-bold text-gray-900">{item.firstName} {item.lastName || ''}</Text>
            <Text className="text-gray-500 mt-1">{item.phone}</Text>
          </View>
        </View>
        <Text className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );
}
