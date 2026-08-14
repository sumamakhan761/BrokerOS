import React from 'react';
import { View, Text } from 'react-native';
import { Award, Building2, Users } from 'lucide-react-native';

export function CPLeaderboards({ leaderboards }: { leaderboards: any }) {
  if (!leaderboards) return null;

  const { topProjects = [], topClosingManagers = [], topSourcingManagers = [], topBrokers = [] } = leaderboards;

  return (
    <View className="space-y-6">
      {/* Top Projects */}
      <View className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <Building2 size={20} color="#6366f1" className="mr-2" />
            <Text className="text-xl font-bold text-slate-900 ml-2">Top Projects</Text>
          </View>
        </View>

        {topProjects.length === 0 ? (
          <Text className="text-sm text-slate-500">No project data available.</Text>
        ) : (
          <View className="space-y-4">
            {topProjects.map((proj: any, idx: number) => {
              const bg = idx === 0 ? 'bg-yellow-100' : idx === 1 ? 'bg-slate-100' : idx === 2 ? 'bg-orange-100' : 'bg-blue-50';
              const text = idx === 0 ? 'text-yellow-600' : idx === 1 ? 'text-slate-600' : idx === 2 ? 'text-orange-600' : 'text-blue-600';
              return (
                <View key={proj.id} className="flex-row items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 mb-2">
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${bg}`}>
                      <Text className={`font-black ${text}`}>#{idx + 1}</Text>
                    </View>
                    <Text className="font-bold text-slate-900 flex-1" numberOfLines={1}>{proj.name}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-black text-slate-900">{proj.bookings}</Text>
                    <Text className="text-[10px] font-bold text-slate-400">BOOKINGS</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Top Brokers */}
      <View className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Users size={16} color="#64748b" className="mr-2" />
            <Text className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-2">Top Brokers</Text>
          </View>
        </View>

        {topBrokers.length === 0 ? (
          <Text className="text-sm text-slate-500">No broker data available.</Text>
        ) : (
          <View className="space-y-3">
            {topBrokers.map((broker: any, idx: number) => (
              <View key={broker.id} className="flex-row items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-2">
                <View className="flex-row items-center flex-1 pr-2">
                  <View className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-indigo-600 font-bold text-xs">{broker.name?.[0] || 'B'}</Text>
                  </View>
                  <Text className="font-bold text-slate-700 flex-1" numberOfLines={1}>{broker.name}</Text>
                </View>
                <View className="flex-row items-end">
                  <Text className="text-sm font-black text-slate-900 mr-1">{broker.bookings}</Text>
                  <Text className="text-xs font-semibold text-slate-500 mb-0.5">deals</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Top Internal Teams */}
      <View className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <Award size={20} color="#6366f1" className="mr-2" />
            <Text className="text-xl font-bold text-slate-900 ml-2">Top Internal Teams</Text>
          </View>
        </View>

        {/* Top Sourcing Managers */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Top Sourcing Managers
          </Text>
          {topSourcingManagers.length === 0 ? (
            <Text className="text-sm text-slate-500">No sourcing manager data available.</Text>
          ) : (
            <View className="space-y-3">
              {topSourcingManagers.map((sm: any, idx: number) => (
                <View key={sm.id} className="flex-row items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-2">
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-3">
                      <Text className="text-emerald-600 font-bold text-xs">{sm.name?.[0] || 'S'}</Text>
                    </View>
                    <Text className="font-bold text-slate-700 flex-1" numberOfLines={1}>{sm.name}</Text>
                  </View>
                  <View className="flex-row items-end">
                    <Text className="text-sm font-black text-slate-900 mr-1">{sm.bookings}</Text>
                    <Text className="text-xs font-semibold text-slate-500 mb-0.5">broker deals</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Top Closing Managers */}
        <View>
          <Text className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Top Closing Managers
          </Text>
          {topClosingManagers.length === 0 ? (
            <Text className="text-sm text-slate-500">No closing manager data available.</Text>
          ) : (
            <View className="space-y-3">
              {topClosingManagers.map((cm: any, idx: number) => (
                <View key={cm.id} className="flex-row items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-2">
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                      <Text className="text-blue-600 font-bold text-xs">{cm.name?.[0] || 'C'}</Text>
                    </View>
                    <Text className="font-bold text-slate-700 flex-1" numberOfLines={1}>{cm.name}</Text>
                  </View>
                  <View className="flex-row items-end">
                    <Text className="text-sm font-black text-slate-900 mr-1">{cm.bookings}</Text>
                    <Text className="text-xs font-semibold text-slate-500 mb-0.5">units sold</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
