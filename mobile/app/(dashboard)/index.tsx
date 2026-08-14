import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function DashboardIndex() {
  return (
    <View className="flex-1 bg-[#f8fafc] justify-center items-center p-8">
      <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-6">
        <Feather name="layout" size={40} color="#2563eb" />
      </View>
      <Text className="text-3xl font-bold text-gray-900 mb-4 text-center">OpenEstate</Text>
      <Text className="text-base text-gray-500 text-center leading-6">
        Welcome back. Please select a module from the bottom tabs to continue. Your access is filtered by your assigned role.
      </Text>
    </View>
  );
}
