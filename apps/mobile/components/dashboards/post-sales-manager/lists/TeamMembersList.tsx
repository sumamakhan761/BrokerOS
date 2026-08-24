import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Users } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Avatar } from '@/components/ui/Avatar';

interface PostSalesEmployee {
  id: string;
  name: string;
  username: string;
  image: string | null;
  employeeCode: string | null;
  isOnCall?: boolean;
  stats: {
    totalBookings: number;
    pendingDocs: number;
    loanCases: number;
  };
}

export function TeamMembersList({ employees }: { employees: PostSalesEmployee[] }) {
  const router = useRouter();

  const handlePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(dashboard)/post-sales-manager/employees/${id}` as any);
  };

  return (
    <View className="mt-4 mb-6">
      <View className="flex-row items-center gap-2 mb-3 px-1">
        <Users size={16} color="#64748b" />
        <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Team Members ({employees.length})
        </Text>
      </View>

      {employees.length === 0 ? (
        <View className="bg-white rounded-3xl p-6 border border-slate-200/80 items-center justify-center">
          <Users size={32} color="#cbd5e1" />
          <Text className="text-sm font-semibold text-slate-400 mt-2">
            No employees found
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {employees.map((emp) => (
            <Pressable
              key={emp.id}
              onPress={() => handlePress(emp.id)}
              accessibilityRole="button"
              accessibilityLabel={`View details for ${emp.name || emp.username}`}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex-row items-center justify-between active:scale-[0.98] transition-transform"
            >
              <View className="flex-row items-center flex-1 pr-2">
                <Avatar
                  name={emp.name || emp.username}
                  imageUri={emp.image}
                  size={46}
                  status={emp.isOnCall ? 'online' : 'away'}
                />

                <View className="ml-3 flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text
                      numberOfLines={1}
                      className="font-bold text-base text-slate-900 leading-tight"
                      style={{ includeFontPadding: false }}
                    >
                      {emp.name || emp.username}
                    </Text>
                    {emp.employeeCode && (
                      <Text className="text-[11px] font-semibold text-slate-400">
                        #{emp.employeeCode}
                      </Text>
                    )}
                  </View>

                  {/* On-call status pill */}
                  <View className="flex-row items-center mt-1">
                    <View
                      className={`flex-row items-center px-2 py-0.5 rounded-full gap-1.5 ${
                        emp.isOnCall
                          ? 'bg-emerald-50 border border-emerald-200/60'
                          : 'bg-slate-100 border border-slate-200/60'
                      }`}
                    >
                      <View
                        className={`w-1.5 h-1.5 rounded-full ${
                          emp.isOnCall ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      <Text
                        className={`text-[10px] font-bold ${
                          emp.isOnCall ? 'text-emerald-700' : 'text-slate-600'
                        }`}
                        style={{ includeFontPadding: false }}
                      >
                        {emp.isOnCall ? 'On Call' : 'Available'}
                      </Text>
                    </View>
                  </View>

                  {/* Post sales metrics */}
                  <View className="flex-row items-center gap-3 mt-2">
                    <Text className="text-xs text-slate-500 font-medium">
                      <Text className="font-extrabold text-blue-600">
                        {emp.stats.totalBookings}
                      </Text>{' '}
                      Bookings
                    </Text>
                    <Text className="text-slate-300">•</Text>
                    <Text className="text-xs text-slate-500 font-medium">
                      <Text className="font-extrabold text-amber-600">
                        {emp.stats.pendingDocs}
                      </Text>{' '}
                      Docs Pend.
                    </Text>
                    <Text className="text-slate-300">•</Text>
                    <Text className="text-xs text-slate-500 font-medium">
                      <Text className="font-extrabold text-indigo-600">
                        {emp.stats.loanCases}
                      </Text>{' '}
                      Loans
                    </Text>
                  </View>
                </View>
              </View>

              <ChevronRight size={18} color="#94a3b8" strokeWidth={2.2} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
