import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface StatusModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentStatus: string;
  onStatusChange: (status: string) => void;
  availableStatuses?: string[];
}

export default function StatusModal({ isVisible, onClose, currentStatus, onStatusChange, availableStatuses = ['NEW', 'CONTACTED', 'INTERESTED', 'QUALIFIED', 'SITE_VISIT_SCHEDULED', 'LOST'] }: StatusModalProps) {
  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 shadow-xl">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">Change Status</Text>
            <TouchableOpacity onPress={onClose}><Feather name="x" size={24} color="#64748b" /></TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap gap-2 pb-6">
            {availableStatuses.map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => onStatusChange(s)}
                className={`px-4 py-2 rounded-full border mb-2 ${currentStatus === s ? 'bg-blue-600 border-blue-600' : 'bg-gray-50 border-gray-200'}`}
              >
                <Text className={currentStatus === s ? 'text-white font-bold text-xs' : 'text-gray-700 font-medium text-xs'}>
                  {s.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
