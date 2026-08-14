import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Lead } from '../misc/lead-management-types';

interface LeadListItemProps {
  item: Lead;
  selectionMode: boolean;
  isSelected: boolean;
  toggleSelection: (id: string) => void;
  onPressLead: (id: string) => void;
  onLongPressLead: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'NEW': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'CONTACTED': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'QUALIFIED': return 'bg-green-100 text-green-700 border-green-200';
    case 'LOST': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export default function LeadListItem({
  item,
  selectionMode,
  isSelected,
  toggleSelection,
  onPressLead,
  onLongPressLead
}: LeadListItemProps) {
  return (
    <TouchableOpacity
      onPress={() => {
        if (selectionMode) {
          toggleSelection(item.id);
        } else {
          onPressLead(item.id);
        }
      }}
      onLongPress={() => {
        if (!selectionMode) {
          onLongPressLead(item.id);
        }
      }}
      className={`bg-white p-4 mb-3 rounded-xl border ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} shadow-sm flex-row items-center`}
    >
      {selectionMode && (
        <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
          {isSelected && <Feather name="check" size={14} color="white" />}
        </View>
      )}
      <View className="flex-1">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-base font-bold text-gray-900">{item.firstName} {item.lastName}</Text>
          <View className={`px-2 py-1 rounded-full border ${getStatusColor(item.status)}`}>
            <Text className="text-[10px] font-bold uppercase">{item.status}</Text>
          </View>
        </View>
        <View className="flex-row items-center mt-1">
          <Feather name="phone" size={12} color="#64748b" />
          <Text className="text-sm text-gray-500 ml-1">{item.phone}</Text>
        </View>
      </View>
      <View className="ml-3 items-center justify-center bg-green-50 w-10 h-10 rounded-full border border-green-100">
        <Text className="text-green-700 font-bold text-sm">{item.score}</Text>
      </View>
    </TouchableOpacity>
  );
}
