import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MoreMenuScreen() {
  const router = useRouter();

  const menuItems = [
    { title: 'Inventory', icon: 'package', route: '/(dashboard)/sales-manager/inventory', color: '#d97706', bg: 'bg-amber-100' },
    { title: 'Booking', icon: 'calendar', route: '/(dashboard)/sales-manager/booking', color: '#0d9488', bg: 'bg-teal-100' },
    { title: 'Analytics', icon: 'pie-chart', route: '/(dashboard)/sales-manager/analytics', color: '#10b981', bg: 'bg-emerald-100' },
    { title: 'Settings', icon: 'settings', route: '/(dashboard)/sales-manager/settings', color: '#475569', bg: 'bg-slate-100' },
  ];

  return (
    <View className="flex-1 bg-[#f8fafc] p-6">
      <View className="flex-row items-center mb-8">
        <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-4">
          <Feather name="menu" size={24} color="#334155" />
        </View>
        <View>
          <Text className="text-2xl font-bold text-gray-900">More Options</Text>
          <Text className="text-gray-500 text-sm">Additional tools & settings</Text>
        </View>
      </View>
      
      <ScrollView className="bg-white rounded-3xl shadow-sm border border-gray-100 flex-1 mb-20">
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={item.title}
            onPress={() => router.push(item.route as any)}
            className={`flex-row items-center p-5 ${index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''}`}
          >
            <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${item.bg}`}>
              <Feather name={item.icon as any} size={22} color={item.color} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">{item.title}</Text>
            </View>
            <Feather name="chevron-right" size={24} color="#cbd5e1" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
