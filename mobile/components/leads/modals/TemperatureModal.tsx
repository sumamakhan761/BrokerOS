import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface TemperatureModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentTemperature?: string;
  onTemperatureChange: (temp: string) => void;
}

export default function TemperatureModal({ isVisible, onClose, currentTemperature, onTemperatureChange }: TemperatureModalProps) {
  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 shadow-xl">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">Change Temperature</Text>
            <TouchableOpacity onPress={onClose}><Feather name="x" size={24} color="#64748b" /></TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap gap-2 pb-6">
            {['HOT', 'WARM', 'COLD'].map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => onTemperatureChange(t)}
                className={`px-4 py-2 rounded-full border mb-2 ${currentTemperature === t ? 'bg-orange-600 border-orange-600' : 'bg-gray-50 border-gray-200'}`}
              >
                <Text className={currentTemperature === t ? 'text-white font-bold text-xs' : 'text-gray-700 font-medium text-xs'}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
