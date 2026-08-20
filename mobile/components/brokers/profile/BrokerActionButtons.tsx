import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface BrokerActionButtonsProps {
  broker: any;
  handleOpenMeetingModal?: () => void;
  setIsFollowUpModalOpen: (val: boolean) => void;
}

export function BrokerActionButtons({ broker, handleOpenMeetingModal, setIsFollowUpModalOpen }: BrokerActionButtonsProps) {
  return (
    <View className="flex-row flex-wrap gap-2 mb-4 justify-between mt-4">
      <TouchableOpacity onPress={() => Linking.openURL(`tel:${broker.phone}`)} className="w-[48%] py-3 bg-emerald-500 rounded-xl flex-row justify-center items-center shadow-sm">
        <Feather name="phone" size={16} color="white" />
        <Text className="text-white font-bold ml-2">Call</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => Linking.openURL(`whatsapp://send?phone=${broker.phone}`)} className="w-[48%] py-3 bg-[#25D366] rounded-xl flex-row justify-center items-center shadow-sm">
        <Feather name="message-circle" size={16} color="white" />
        <Text className="text-white font-bold ml-2">WhatsApp</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsFollowUpModalOpen(true)} className="w-[48%] py-3 bg-indigo-600 rounded-xl flex-row justify-center items-center shadow-sm mt-2">
        <Feather name="clock" size={16} color="white" />
        <Text className="text-white font-bold ml-2">Follow-up</Text>
      </TouchableOpacity>

      {handleOpenMeetingModal && (
        <TouchableOpacity onPress={handleOpenMeetingModal} className="w-[48%] py-3 bg-indigo-600 rounded-xl flex-row justify-center items-center shadow-sm mt-2">
          <Feather name="users" size={16} color="white" />
          <Text className="text-white font-bold ml-2">Meeting</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
