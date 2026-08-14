import React from 'react';
import { View, Text } from 'react-native';

interface BrokerInformationCardProps {
  broker: any;
}

export function BrokerInformationCard({ broker }: BrokerInformationCardProps) {
  if (!broker) return null;

  return (
    <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mt-4">
      <Text className="text-lg font-bold text-slate-900 mb-4">Broker Information</Text>
      
      <View className="space-y-4">
        <View className="flex-row justify-between mb-3">
          <Text className="text-slate-500 font-bold">RERA</Text>
          <Text className="text-slate-900 font-bold">{broker.reraNumber || 'N/A'}</Text>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="text-slate-500 font-bold">GST</Text>
          <Text className="text-slate-900 font-bold">{broker.gstNumber || 'N/A'}</Text>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="text-slate-500 font-bold">Service Areas</Text>
          <Text className="text-slate-900 font-bold">{broker.serviceAreas || 'N/A'}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-slate-500 font-bold">Source</Text>
          <Text className="text-slate-900 font-bold">{broker.source?.name || 'Manual'}</Text>
        </View>
      </View>
    </View>
  );
}
