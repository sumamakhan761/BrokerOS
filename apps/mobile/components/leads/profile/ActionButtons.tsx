import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LeadProfileData } from '../misc/lead-profile-types';

interface ActionButtonsProps {
  lead: LeadProfileData;
  handleOpenSiteVisitModal?: () => void;
  setIsFollowUpModalOpen: (val: boolean) => void;
}

export default function ActionButtons({ lead, handleOpenSiteVisitModal, setIsFollowUpModalOpen }: ActionButtonsProps) {
  return (
    <View className="flex-row flex-wrap gap-2 mb-4 justify-between">
      <TouchableOpacity onPress={() => Linking.openURL(`tel:${lead.phone}`)} className="w-[48%] py-3 bg-[#10b981] rounded-xl flex-row justify-center items-center shadow-sm">
        <Feather name="phone" size={16} color="white" />
        <Text className="text-white font-bold ml-2">Call</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Linking.openURL(`whatsapp://send?phone=${lead.phone}`)} className="w-[48%] py-3 bg-[#25D366] rounded-xl flex-row justify-center items-center shadow-sm">
        <Feather name="message-circle" size={16} color="white" />
        <Text className="text-white font-bold ml-2">WhatsApp</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsFollowUpModalOpen(true)} className="w-[48%] py-3 bg-blue-600 rounded-xl flex-row justify-center items-center shadow-sm mt-2">
        <Feather name="clock" size={16} color="white" />
        <Text className="text-white font-bold ml-2">Follow-up</Text>
      </TouchableOpacity>
      {handleOpenSiteVisitModal && (
        <TouchableOpacity onPress={handleOpenSiteVisitModal} className="w-[48%] py-3 bg-blue-600 rounded-xl flex-row justify-center items-center shadow-sm mt-2">
          <Feather name="map-pin" size={16} color="white" />
          <Text className="text-white font-bold ml-2">Site Visit</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
