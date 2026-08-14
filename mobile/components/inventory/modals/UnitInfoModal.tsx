import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface UnitInfoModalProps {
  unit: any;
  visible: boolean;
  onClose: () => void;
}

export function UnitInfoModal({ unit, visible, onClose }: UnitInfoModalProps) {
  if (!unit) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESERVED': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'SOLD': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'BLOCKED': return 'bg-slate-200 text-slate-700 border-slate-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View className="flex-1 bg-slate-50">
        <View className="flex-row justify-between items-center p-4 border-b border-slate-200 bg-white">
          <View>
            <Text className="text-xl font-bold text-slate-900">Unit {unit.unitNumber}</Text>
            <Text className="text-xs text-slate-500 mt-1 font-medium">Floor {unit.floor?.floorNumber || 'Unknown'}</Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 rounded-full">
            <Feather name="x" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-5">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-sm font-bold text-slate-500 uppercase">Current Status</Text>
            <View className={`px-4 py-1.5 rounded-full border ${getStatusColor(unit.status).split(' ')[0]} ${getStatusColor(unit.status).split(' ')[2]}`}>
              <Text className={`text-sm font-bold ${getStatusColor(unit.status).split(' ')[1]}`}>
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
          </View>

          <View className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex-row gap-3 mt-4 items-start">
            <Feather name="info" size={20} color="#64748b" className="mt-0.5" />
            <View className="flex-1">
              <Text className="text-slate-700 font-bold mb-1">This unit is unavailable.</Text>
              <Text className="text-slate-500 text-sm leading-5">It has been {unit.status.toLowerCase()} by another executive or manager. Contact your Sales Manager if you believe this is a mistake.</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
