import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LeadProfileData } from '../misc/lead-profile-types';

interface AINextStepProps {
  suggestion?: string;
}

export default function AINextStep({ suggestion }: AINextStepProps) {
  if (!suggestion) return null;
  
  return (
    <View className="bg-purple-50 rounded-2xl border border-purple-200 p-4 mb-4 shadow-sm flex-row items-start">
      <View className="bg-purple-100 p-1.5 rounded-full mr-3 mt-0.5">
        <Feather name="zap" size={16} color="#7e22ce" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold text-purple-900 mb-1">AI Next Step</Text>
        <Text className="text-sm text-purple-800 leading-5">
          {suggestion}
        </Text>
      </View>
    </View>
  );
}
