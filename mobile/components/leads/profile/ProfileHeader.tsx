import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { LeadProfileData } from '../misc/lead-profile-types';

interface ProfileHeaderProps {
  lead: LeadProfileData;
  uploading: boolean;
  handleAvatarUpload: () => void;
  setIsStatusModalOpen: (val: boolean) => void;
  setIsTemperatureModalOpen: (val: boolean) => void;
  handleAiAutoAdvance?: () => void;
  isAiAdvancing?: boolean;
  isPreSales?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'NEW': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'CONTACTED': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    case 'INTERESTED': return 'bg-green-100 text-green-700 border-green-200';
    case 'QUALIFIED': return 'bg-teal-100 text-teal-700 border-teal-200';
    case 'SITE_VISIT_SCHEDULED': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'SITE_VISIT_COMPLETED': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'NEGOTIATION': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'BOOKING': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'DOCUMENT': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'LOAN': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'AGREEMENT': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'HANDOVER': return 'bg-pink-100 text-pink-700 border-pink-200';
    case 'LOST': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export default function ProfileHeader({
  lead,
  uploading,
  handleAvatarUpload,
  setIsStatusModalOpen,
  setIsTemperatureModalOpen,
  handleAiAutoAdvance,
  isAiAdvancing,
  isPreSales
}: ProfileHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isPostSales = pathname.includes('/post-sales');
  const baseURL = process.env.EXPO_PUBLIC_API_URL as string;

  return (
    <View className="p-4 bg-white border-b border-gray-200 shadow-sm flex-row items-center pt-12">
      <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
        <Feather name="arrow-left" size={24} color="#0f172a" />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleAvatarUpload} className="mr-3 relative">
        {lead.avatar ? (
          <Image
            source={{ uri: `${baseURL}/api/leads/${lead.id}/avatar-image` }}
            className="w-12 h-12 rounded-full border border-gray-200"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center border border-gray-200">
            <Feather name="user" size={20} color="#94a3b8" />
          </View>
        )}
        {uploading && (
          <View className="absolute inset-0 bg-black/30 rounded-full items-center justify-center">
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      <View className="flex-1">
        <Text className="text-xl font-bold text-gray-900">{lead.firstName} {lead.lastName}</Text>
        <Text className="text-sm text-gray-500">{lead.phone}</Text>
        <View className="flex-row items-center gap-2 mt-2 flex-wrap">
          <TouchableOpacity onPress={() => setIsStatusModalOpen(true)} className={`px-2 py-0.5 rounded-md border ${getStatusColor(lead.status)}`}>
            <Text className="text-[10px] font-bold uppercase">{lead.status}</Text>
          </TouchableOpacity>

          {isPreSales && handleAiAutoAdvance && (
            <TouchableOpacity
              onPress={handleAiAutoAdvance}
              disabled={isAiAdvancing || lead.status === 'QUALIFIED'}
              className={`px-2 py-0.5 rounded-md border bg-purple-50 border-purple-200 flex-row items-center ${(isAiAdvancing || lead.status === 'QUALIFIED') ? 'opacity-50' : ''}`}
            >
              {isAiAdvancing ? (
                <ActivityIndicator size="small" color="#7e22ce" style={{ marginRight: 4, width: 10, height: 10 }} />
              ) : (
                <Feather name="zap" size={10} color="#7e22ce" style={{ marginRight: 2 }} />
              )}
              <Text className="text-[10px] font-bold text-purple-700 uppercase">Auto-Advance</Text>
            </TouchableOpacity>
          )}

          {lead.temperature ? (
            <TouchableOpacity onPress={() => setIsTemperatureModalOpen(true)} className="px-2 py-0.5 rounded-md border bg-orange-50 border-orange-200">
              <Text className="text-[10px] font-bold text-orange-700 uppercase">{lead.temperature}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsTemperatureModalOpen(true)} className="px-2 py-0.5 rounded-md border bg-gray-50 border-gray-200">
              <Text className="text-[10px] font-bold text-gray-700 uppercase">SET TEMP</Text>
            </TouchableOpacity>
          )}
          {lead.score !== null && lead.score !== undefined && (
            <View className="px-2 py-0.5 rounded-md border bg-purple-50 border-purple-200 flex-row items-center">
              <Feather name="activity" size={10} color="#7e22ce" style={{ marginRight: 2 }} />
              <Text className="text-[10px] font-bold text-purple-700 uppercase">Score: {lead.score}</Text>
            </View>
          )}
          {isPostSales && (lead.processionStatus || lead.processionTimeline) && (
            <>
              {lead.processionStatus && (
                <View className="px-2 py-0.5 rounded-md border bg-blue-50 border-blue-200 flex-row items-center">
                  <Text className="text-[10px] font-bold text-blue-700 uppercase">Status: {lead.processionStatus.replace(/_/g, ' ')}</Text>
                </View>
              )}
              {lead.processionTimeline && (
                <View className="px-2 py-0.5 rounded-md border bg-indigo-50 border-indigo-200 flex-row items-center">
                  <Feather name="clock" size={10} color="#4338ca" style={{ marginRight: 2 }} />
                  <Text className="text-[10px] font-bold text-indigo-700 uppercase">
                    In {lead.processionTimeline.value} {lead.processionTimeline.unit}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}
