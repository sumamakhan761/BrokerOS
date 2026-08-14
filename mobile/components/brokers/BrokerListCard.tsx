import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface BrokerListCardProps {
  broker: any;
  onPress: () => void;
  onAssign?: () => void;
}

export default function BrokerListCard({ broker, onPress, onAssign }: BrokerListCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DEAL': return 'bg-emerald-100 border-emerald-200 text-emerald-700';
      case 'VISIT': return 'bg-amber-100 border-amber-200 text-amber-700';
      case 'NEW': return 'bg-blue-100 border-blue-200 text-blue-700';
      case 'CONTACTED': return 'bg-indigo-100 border-indigo-200 text-indigo-700';
      default: return 'bg-slate-100 border-slate-200 text-slate-700';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-4"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-900" numberOfLines={1}>
            {broker.companyName || 'No Company Name'}
          </Text>
          <Text className="text-sm text-slate-500 mt-0.5">{broker.name}</Text>
        </View>
        <View className={`px-2.5 py-1 rounded-full border ${getStatusColor(broker.status)}`}>
          <Text className={`text-xs font-bold ${getStatusColor(broker.status).split(' ')[2]}`}>
            {broker.status}
          </Text>
        </View>
      </View>

      <View className="mt-3 pt-3 border-t border-slate-100 flex-row justify-between items-center">
        <View className="flex-row items-center flex-1">
          <Feather name="phone" size={14} color="#64748b" />
          <Text className="text-slate-600 text-sm ml-1.5">{broker.phone}</Text>
        </View>
        <View className="flex-row items-center flex-1 justify-end">
          <Feather name="map-pin" size={14} color="#64748b" />
          <Text className="text-slate-600 text-sm ml-1.5" numberOfLines={1}>
            {broker.city || 'N/A'}
          </Text>
        </View>
      </View>

      {onAssign && (
        <View className="mt-3 pt-3 border-t border-slate-100">
          <TouchableOpacity
            onPress={onAssign}
            className="flex-row items-center justify-center bg-indigo-50 py-2 rounded-xl"
          >
            <Feather name="user-plus" size={16} color="#4f46e5" />
            <Text className="text-indigo-700 font-bold ml-2">Assign Manager</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}
