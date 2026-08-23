import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface UnitDetailsViewProps {
  unit: any;
  bookingData: any;
  onEditPress: () => void;
}

export function UnitDetailsView({ unit, bookingData, onEditPress }: UnitDetailsViewProps) {
  return (
    <View className="space-y-6">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-sm font-bold text-slate-500 uppercase">Current Status</Text>
        <View className={`px-4 py-1.5 rounded-full border ${unit.status === 'AVAILABLE' ? 'bg-emerald-100 border-emerald-200' : 'bg-slate-200 border-slate-300'}`}>
          <Text className={`text-sm font-bold ${unit.status === 'AVAILABLE' ? 'text-emerald-700' : 'text-slate-700'}`}>
            {unit.status}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap justify-between">
        <View className="w-[48%] bg-white p-4 rounded-xl border border-slate-200 mb-4">
          <Text className="text-xs text-slate-400 font-bold uppercase mb-1">Type</Text>
          <Text className="text-slate-900 font-bold">{unit.type.replace('_', ' ')}</Text>
        </View>
        <View className="w-[48%] bg-white p-4 rounded-xl border border-slate-200 mb-4">
          <Text className="text-xs text-slate-400 font-bold uppercase mb-1">Facing</Text>
          <Text className="text-slate-900 font-bold">{unit.facing || 'N/A'}</Text>
        </View>
        <View className="w-[48%] bg-white p-4 rounded-xl border border-slate-200 mb-4">
          <Text className="text-xs text-slate-400 font-bold uppercase mb-1">Carpet Area</Text>
          <Text className="text-slate-900 font-bold">{unit.carpetArea} sq.ft</Text>
        </View>
        <View className="w-[48%] bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4">
          <Text className="text-xs text-indigo-500 font-bold uppercase mb-1">Base Price</Text>
          <Text className="text-indigo-900 font-bold text-lg">${Number(unit.basePrice).toLocaleString()}</Text>
        </View>

        {/* Display Brokerage Record from Booking, otherwise fallback to Unit Comm */}
        {bookingData?.brokerageRecords && bookingData.brokerageRecords.length > 0 ? (
          bookingData.brokerageRecords.map((record: any, idx: number) => (
            <View key={record.id || idx} className="w-full bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-4">
              <Text className="text-xs text-emerald-500 font-bold uppercase mb-1">Commission ({record.status})</Text>
              <Text className="text-emerald-900 font-bold text-lg">{record.brokeragePercent ? `${record.brokeragePercent}%` : 'Flat'} <Text className="text-sm font-medium">(${Number(record.brokerageAmount).toLocaleString()})</Text></Text>
              {record.status === 'PAID' && (
                <Text className="text-xs text-emerald-700 font-bold mt-1">Net Paid: ${Number(record.paidAmount).toLocaleString()}</Text>
              )}
            </View>
          ))
        ) : (
          <View className="w-full bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-4">
            <Text className="text-xs text-emerald-500 font-bold uppercase mb-1">Commission (%)</Text>
            <Text className="text-emerald-900 font-bold text-lg">{unit.commissionPercentage || 0}% <Text className="text-sm font-medium">(${(Number(unit.basePrice) * Number(unit.commissionPercentage || 0) / 100).toLocaleString()})</Text></Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={onEditPress}
        className="w-full py-4 bg-slate-900 rounded-xl items-center justify-center flex-row gap-2 mt-4 shadow-sm"
      >
        <Feather name="edit-3" size={18} color="white" />
        <Text className="text-white font-bold text-base">Manual Edit</Text>
      </TouchableOpacity>
    </View>
  );
}
