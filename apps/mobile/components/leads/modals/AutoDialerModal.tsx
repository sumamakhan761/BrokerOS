import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DialerLead } from '@/hooks/useAutoDialer';

interface AutoDialerModalProps {
  dialerState: string;
  queue: DialerLead[];
  currentIndex: number;
  currentLead: DialerLead | null;
  countdown: number;
  cancelDialer: () => void;
}

export default function AutoDialerModal({
  dialerState,
  queue,
  currentIndex,
  currentLead,
  countdown,
  cancelDialer
}: AutoDialerModalProps) {
  return (
    <Modal
      visible={dialerState !== 'IDLE' && dialerState !== 'FINISHED' && dialerState !== 'CANCELLED'}
      animationType="slide"
      transparent={true}
    >
      <View className="flex-1 bg-black/60 justify-center items-center p-6">
        <View className="bg-white w-full rounded-3xl p-6 shadow-xl items-center">
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Feather name="phone-forwarded" size={32} color="#2563eb" />
          </View>

          <Text className="text-2xl font-bold text-gray-900 mb-1">Auto Dialer Active</Text>
          <Text className="text-sm font-medium text-blue-600 mb-6 uppercase tracking-wider">
            {dialerState === 'DIALING' && 'Calling...'}
            {dialerState === 'WAITING' && 'Waiting for next call...'}
          </Text>

          {currentLead && (
            <View className="bg-gray-50 border border-gray-100 rounded-xl w-full p-4 mb-6 items-center">
              <Text className="text-sm text-gray-500 mb-1">
                Call {currentIndex + 1} of {queue.length}
              </Text>
              <Text className="text-xl font-bold text-gray-900">{currentLead.name}</Text>
              <Text className="text-base text-gray-600 mt-1">{currentLead.phone}</Text>
            </View>
          )}

          {dialerState === 'WAITING' && (
            <View className="items-center mb-6">
              <Text className="text-3xl font-black text-blue-600">{countdown}</Text>
              <Text className="text-xs text-gray-500">Seconds</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={cancelDialer}
            className="bg-red-500 w-full py-4 rounded-xl flex-row justify-center items-center"
          >
            <Feather name="x-circle" size={20} color="white" />
            <Text className="text-white font-bold text-lg ml-2">Stop Dialer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
