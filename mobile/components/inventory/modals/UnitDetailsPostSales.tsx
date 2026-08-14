import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface UnitDetailsPostSalesProps {
  unit: any;
  onUpdateTimelinePress: () => void;
}

export function UnitDetailsPostSales({ unit, onUpdateTimelinePress }: UnitDetailsPostSalesProps) {
  return (
    <View>
      <View className="mt-8 border-t border-slate-200 pt-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-sm font-bold text-slate-700 uppercase">Procession Timeline</Text>
          <TouchableOpacity
            onPress={onUpdateTimelinePress}
            className="bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"
          >
            <Text className="text-indigo-600 font-bold text-xs">Update Timeline</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white p-4 rounded-xl border border-slate-200">
          <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Status</Text>
          <Text className="text-slate-900 font-bold text-lg mb-4">
            {unit.processionStatus ? unit.processionStatus.replace(/_/g, ' ') : 'Not Started'}
          </Text>

          <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Remaining Timeline</Text>
          <Text className="text-slate-900 font-bold">
            {unit.processionTimelineUnit ? `${unit.processionTimelineValue} ${unit.processionTimelineUnit}` : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Customer & Post-Sales Section */}
      {unit.bookings && unit.bookings.length > 0 && (
        <View className="mt-8 border-t border-slate-200 pt-6">
          <Text className="text-sm font-bold text-slate-700 uppercase mb-4">Customer Details</Text>
          <View className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm elevation-2 mb-6">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center">
                <Text className="text-indigo-700 font-bold text-lg">
                  {unit.bookings[0].customer?.firstName?.[0] || 'C'}
                </Text>
              </View>
              <View>
                <Text className="text-slate-900 font-bold text-lg">
                  {unit.bookings[0].customer?.firstName} {unit.bookings[0].customer?.lastName}
                </Text>
                <Text className="text-slate-500 text-sm font-medium">
                  {unit.bookings[0].customer?.phone || 'No phone provided'}
                </Text>
              </View>
            </View>
            {unit.bookings[0].customer?.email && (
              <View className="flex-row items-center gap-2 mt-2">
                <Feather name="mail" size={14} color="#64748b" />
                <Text className="text-slate-600 font-medium text-sm">{unit.bookings[0].customer.email}</Text>
              </View>
            )}
          </View>

          <Text className="text-sm font-bold text-slate-700 uppercase mb-4">Post-Sales Pipeline</Text>
          
          {/* Loan Case */}
          <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm elevation-1 mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className={`w-10 h-10 rounded-full items-center justify-center ${unit.bookings[0].loanCase?.status === 'APPROVED' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                <Feather name="credit-card" size={18} color={unit.bookings[0].loanCase?.status === 'APPROVED' ? '#059669' : '#d97706'} />
              </View>
              <View>
                <Text className="text-slate-900 font-bold">Loan Processing</Text>
                <Text className="text-slate-500 text-xs font-medium">{unit.bookings[0].loanCase?.status?.replace(/_/g, ' ') || 'Not Started'}</Text>
              </View>
            </View>
          </View>

          {/* Agreement */}
          <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm elevation-1 mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className={`w-10 h-10 rounded-full items-center justify-center ${unit.bookings[0].agreement?.status === 'COMPLETED' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                <Feather name="file-text" size={18} color={unit.bookings[0].agreement?.status === 'COMPLETED' ? '#059669' : '#2563eb'} />
              </View>
              <View>
                <Text className="text-slate-900 font-bold">Agreement Execution</Text>
                <Text className="text-slate-500 text-xs font-medium">{unit.bookings[0].agreement?.status?.replace(/_/g, ' ') || 'Not Started'}</Text>
              </View>
            </View>
          </View>

          {/* Handover */}
          <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm elevation-1 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className={`w-10 h-10 rounded-full items-center justify-center ${unit.bookings[0].possession?.status === 'HANDED_OVER' ? 'bg-emerald-100' : 'bg-purple-100'}`}>
                <Feather name="key" size={18} color={unit.bookings[0].possession?.status === 'HANDED_OVER' ? '#059669' : '#9333ea'} />
              </View>
              <View>
                <Text className="text-slate-900 font-bold">Handover & Keys</Text>
                <Text className="text-slate-500 text-xs font-medium">{unit.bookings[0].possession?.status?.replace(/_/g, ' ') || 'Not Started'}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
