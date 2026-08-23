import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface BrokerListCardProps {
  broker: any;
  onPress: () => void;
  onAssign?: () => void;
  showAssignee?: boolean;
}

export default function BrokerListCard({ broker, onPress, onAssign, showAssignee }: BrokerListCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DEAL': return 'bg-green-100 text-green-700 border-green-200';
      case 'VISIT': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'NEW': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CONTACTED': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const displayName = broker.companyName || broker.name || 'Unknown Broker';
  const assignedName = broker.sourcingManager ? (broker.sourcingManager.name || broker.sourcingManager.username) : 'Unassigned';

  return (
    <View className="mb-3">
      <TouchableOpacity
        onPress={onPress}
        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-row items-center"
        activeOpacity={0.7}
      >
        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-1">
            <Text className="text-base font-bold text-gray-900" numberOfLines={1}>{displayName}</Text>
            <View className={`px-2 py-1 rounded-full border ${getStatusColor(broker.status)}`}>
              <Text className="text-[10px] font-bold uppercase">{broker.status}</Text>
            </View>
          </View>
          <View className="flex-row items-center mt-1">
            <Feather name="phone" size={12} color="#64748b" />
            <Text className="text-sm text-gray-500 ml-1">{broker.phone}</Text>
          </View>
        </View>
        {showAssignee && (
          <View className="ml-3 items-center justify-center bg-gray-50 px-3 h-8 rounded-full border border-gray-200">
            <Text className="text-gray-700 font-bold text-xs">{assignedName}</Text>
          </View>
        )}
      </TouchableOpacity>

      {onAssign && (
        <TouchableOpacity
          onPress={onAssign}
          className="flex-row items-center justify-center bg-indigo-50 py-2 rounded-xl mt-1 border border-indigo-100"
        >
          <Feather name="user-plus" size={16} color="#4f46e5" />
          <Text className="text-indigo-700 font-bold ml-2">Assign Manager</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
