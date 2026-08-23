import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function SettingsScreen() {
  return (
    <View className="flex-1 bg-[#f8fafc] p-6">
      <View className="flex-row items-center mb-8">
        <View className="w-12 h-12 bg-slate-100 rounded-full items-center justify-center mr-4">
          <Feather name="settings" size={24} color="#475569" />
        </View>
        <View>
          <Text className="text-2xl font-bold text-gray-900">Settings</Text>
          <Text className="text-gray-500 text-sm">App preferences</Text>
        </View>
      </View>
      
      <View className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-20 overflow-hidden">
        <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
          <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4">
            <Feather name="user" size={20} color="#64748b" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">Profile Information</Text>
            <Text className="text-sm text-gray-500">Update your name and contact details</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#cbd5e1" />
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
          <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4">
            <Feather name="bell" size={20} color="#64748b" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">Notifications</Text>
            <Text className="text-sm text-gray-500">Manage push notifications</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#cbd5e1" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center p-4">
          <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4">
            <Feather name="lock" size={20} color="#64748b" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">Security</Text>
            <Text className="text-sm text-gray-500">Password and authentication</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#cbd5e1" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
