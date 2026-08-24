import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2, PieChart, Settings, ChevronRight, Menu } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function SalesExecutiveMoreMenuScreen() {
  const router = useRouter();

  const menuItems = [
    {
      title: 'Inventory',
      description: 'Project towers, floors, and unit grid',
      icon: Building2,
      route: '/(dashboard)/sales-executive/inventory',
      iconColor: '#2563eb',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Analytics',
      description: 'Sales performance & unit heatmap',
      icon: PieChart,
      route: '/(dashboard)/sales-executive/analytics',
      iconColor: '#059669',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      title: 'Settings',
      description: 'Account preferences & app settings',
      icon: Settings,
      route: '/(dashboard)/sales-executive/settings',
      iconColor: '#475569',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-200/80',
    },
  ];

  const handlePress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="px-5 pt-2 pb-5">
        <View className="flex-row items-center gap-3 mb-1">
          <View className="w-10 h-10 bg-blue-50 rounded-2xl items-center justify-center border border-blue-100">
            <Menu size={20} color="#2563eb" strokeWidth={2.2} />
          </View>
          <View>
            <Text className="text-2xl font-black text-slate-900 leading-tight">More Options</Text>
            <Text className="text-xs font-semibold text-slate-500 mt-0.5">Additional tools & operations</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="gap-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Pressable
                key={item.title}
                onPress={() => handlePress(item.route)}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                className="bg-white rounded-3xl p-4.5 border border-slate-200/80 shadow-xs flex-row items-center justify-between active:scale-[0.98] transition-transform"
              >
                <View className="flex-row items-center flex-1 pr-3">
                  <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-3.5 border ${item.bgColor} ${item.borderColor}`}>
                    <Icon size={22} color={item.iconColor} strokeWidth={2} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-base font-bold text-slate-900 leading-tight"
                      style={{ includeFontPadding: false }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      className="text-xs text-slate-500 mt-0.5 font-medium"
                      numberOfLines={1}
                      style={{ includeFontPadding: false }}
                    >
                      {item.description}
                    </Text>
                  </View>
                </View>

                <ChevronRight size={18} color="#94a3b8" strokeWidth={2.2} />
              </Pressable>
            );
          })}
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
