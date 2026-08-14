import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface BrokerHeaderProps {
  broker: any;
  uploading?: boolean;
  handleAvatarUpload?: () => void;
  setIsStatusModalOpen?: (val: boolean) => void;
  setIsSubStatusModalOpen?: (val: boolean) => void;
  handleAiAutoAdvance?: () => void;
  isAiAdvancing?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'NEW': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'DEAL': return 'bg-green-100 text-green-700 border-green-200';
    case 'LOST': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getSubStatusColor = (subStatus: string) => {
  switch (subStatus) {
    case 'PENDING': return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'FOLLOW_UP_SCHEDULED': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'MEETING_SCHEDULED': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'NEGOTIATION': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'FINALIZED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export function BrokerHeader({
  broker,
  uploading = false,
  handleAvatarUpload,
  setIsStatusModalOpen,
  setIsSubStatusModalOpen,
  handleAiAutoAdvance,
  isAiAdvancing = false
}: BrokerHeaderProps) {
  const router = useRouter();
  const baseURL = process.env.EXPO_PUBLIC_API_URL as string;

  if (!broker) return null;

  return (
    <View className="p-4 bg-white border-b border-gray-200 shadow-sm flex-row items-center pt-12">
      <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
        <Feather name="arrow-left" size={24} color="#0f172a" />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleAvatarUpload} className="mr-3 relative" disabled={!handleAvatarUpload}>
        {broker.avatar || broker.image ? (
          <Image
            source={{ uri: broker.avatar || broker.image }}
            className="w-12 h-12 rounded-full border border-gray-200"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-indigo-100 items-center justify-center border border-indigo-200">
            <Text className="text-xl font-bold text-indigo-700">
              {broker.name ? broker.name.charAt(0).toUpperCase() : 'B'}
            </Text>
          </View>
        )}
        {uploading && (
          <View className="absolute inset-0 bg-black/30 rounded-full items-center justify-center">
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      <View className="flex-1">
        <Text className="text-xl font-bold text-gray-900">{broker.companyName}</Text>
        <Text className="text-sm text-gray-500">{broker.name} • {broker.phone}</Text>
        
        <View className="flex-row items-center gap-2 mt-2 flex-wrap">
          <TouchableOpacity 
            onPress={() => setIsStatusModalOpen && setIsStatusModalOpen(true)} 
            disabled={!setIsStatusModalOpen}
            className={`px-2 py-0.5 rounded-md border ${getStatusColor(broker.status)}`}
          >
            <Text className="text-[10px] font-bold uppercase">{broker.status}</Text>
          </TouchableOpacity>

          {broker.subStatus && (
            <TouchableOpacity 
              onPress={() => setIsSubStatusModalOpen && setIsSubStatusModalOpen(true)}
              disabled={!setIsSubStatusModalOpen}
              className={`px-2 py-0.5 rounded-md border ${getSubStatusColor(broker.subStatus)}`}
            >
              <Text className="text-[10px] font-bold uppercase">{broker.subStatus.replace(/_/g, ' ')}</Text>
            </TouchableOpacity>
          )}

          {handleAiAutoAdvance && (
            <TouchableOpacity
              onPress={handleAiAutoAdvance}
              disabled={isAiAdvancing || broker.status === 'DEAL'}
              className={`px-2 py-0.5 rounded-md border bg-purple-50 border-purple-200 flex-row items-center ${(isAiAdvancing || broker.status === 'DEAL') ? 'opacity-50' : ''}`}
            >
              {isAiAdvancing ? (
                <ActivityIndicator size="small" color="#7e22ce" style={{ marginRight: 4, width: 10, height: 10 }} />
              ) : (
                <Feather name="zap" size={10} color="#7e22ce" style={{ marginRight: 2 }} />
              )}
              <Text className="text-[10px] font-bold text-purple-700 uppercase">Auto-Advance</Text>
            </TouchableOpacity>
          )}

        </View>
      </View>
    </View>
  );
}
