import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface NewLeadsHeaderProps {
  uploading: boolean;
  onUpload: () => void;
}

export function NewLeadsHeader({ uploading, onUpload }: NewLeadsHeaderProps) {
  return (
    <View className="bg-white p-4 pt-12 flex-row justify-between items-center shadow-sm z-10">
      <Text className="text-xl font-bold text-gray-900">New Leads Pool</Text>
      <TouchableOpacity onPress={onUpload} disabled={uploading} className="bg-indigo-600 px-3 py-2 rounded-lg flex-row items-center">
        {uploading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Feather name="upload" size={16} color="white" />
            <Text className="text-white font-medium ml-1 text-sm">Upload (CSV)</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
