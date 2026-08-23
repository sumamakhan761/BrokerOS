import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DashboardData } from '../misc/types';
import { pct } from '../misc/constants';

interface DailyTasksProps {
  dailyTasks: DashboardData['dailyTasks'];
  hasBacklog: boolean;
}

export default function DailyTasks({ dailyTasks, hasBacklog }: DailyTasksProps) {
  return (
    <View className="mb-2 mt-2">
      <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Daily Tasks</Text>
      <View className={`bg-white rounded-3xl p-5 border border-slate-100 shadow-sm shadow-slate-200/50 mb-1 ${hasBacklog ? 'border-amber-300 bg-amber-50/50' : ''}`}>
        {/* {hasBacklog && (
          <View className="bg-amber-100/80 rounded-xl p-3 mb-4 flex-row items-center gap-2">
            <Feather name="alert-triangle" size={16} color="#d97706" />
            <Text className="text-xs text-amber-600 font-bold tracking-tight">Complete your backlogs first</Text>
          </View>
        )} */}
        <View className="flex-row gap-3">
          {/* Cold Calls */}
          <View className="flex-1 bg-indigo-50 rounded-2xl p-4 border border-indigo-100/50">
            <Text className="text-xs font-semibold text-slate-500 mb-2">Cold Calls</Text>
            <View className="flex-row items-baseline gap-1">
              <Text className="text-3xl font-extrabold text-indigo-600 tracking-tight">
                {dailyTasks.coldCall.done}
              </Text>
              <Text className="text-xs font-medium text-slate-400">
                / {dailyTasks.coldCall.target}
              </Text>
            </View>
            <View className="h-1.5 bg-indigo-200 rounded-full mt-3 overflow-hidden">
              <View style={{ width: `${pct(dailyTasks.coldCall.done, dailyTasks.coldCall.target) * 100}%` }} className="h-full bg-indigo-600 rounded-full" />
            </View>
          </View>
          {/* Follow-ups */}
          <View className="flex-1 bg-emerald-50 rounded-2xl p-4 border border-emerald-100/50">
            <Text className="text-xs font-semibold text-slate-500 mb-2">Follow-ups</Text>
            <View className="flex-row items-baseline gap-1">
              <Text className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                {dailyTasks.followUp.done}
              </Text>
              <Text className="text-xs font-medium text-slate-400">
                / {dailyTasks.followUp.target || '—'}
              </Text>
            </View>
            <View className="h-1.5 bg-emerald-200 rounded-full mt-3 overflow-hidden">
              <View style={{ width: `${pct(dailyTasks.followUp.done, dailyTasks.followUp.target || 1) * 100}%` }} className="h-full bg-emerald-600 rounded-full" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
