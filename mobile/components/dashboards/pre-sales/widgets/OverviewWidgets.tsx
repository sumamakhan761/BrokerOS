import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DashboardData } from '../misc/types';

interface OverviewWidgetsProps {
  widgets: DashboardData['widgets'];
}

export default function OverviewWidgets({ widgets }: OverviewWidgetsProps) {
  return (
    <View className="mb-2">
      <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 mt-1 ml-1">Overview</Text>
      <View className="flex-row flex-wrap justify-between" style={{ gap: 12 }}>
        {[
          { label: 'New Leads', value: widgets.newLeads, icon: 'star', accent: '#4f46e5', bgClass: 'bg-indigo-50', lineClass: 'bg-indigo-500' },
          { label: "Today's Follow-ups", value: widgets.todayFollowUps, icon: 'list', accent: '#059669', bgClass: 'bg-emerald-50', lineClass: 'bg-emerald-500' },
          { label: 'Missed Follow-ups', value: widgets.missedFollowUps, icon: 'alert-triangle', accent: '#d97706', bgClass: 'bg-amber-50', lineClass: 'bg-amber-500' },
          { label: 'Site Visits', value: widgets.siteVisitsScheduled, icon: 'map-pin', accent: '#7c3aed', bgClass: 'bg-violet-50', lineClass: 'bg-violet-500' },
          { label: 'Bookings', value: widgets.bookingsGenerated, icon: 'award', accent: '#e11d48', bgClass: 'bg-rose-50', lineClass: 'bg-rose-500' },
        ].map((w) => (
          <View key={w.label} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm shadow-slate-200/50" style={{ width: '48%' }}>
            <View className={`w-9 h-9 rounded-xl justify-center items-center mb-3 ${w.bgClass}`}>
              <Feather name={w.icon as any} size={18} color={w.accent} />
            </View>
            <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">{w.value}</Text>
            <Text className="text-xs font-medium text-slate-500 mt-1">{w.label}</Text>
            <View className={`h-1 rounded-full mt-3 opacity-60 ${w.lineClass}`} />
          </View>
        ))}
      </View>
    </View>
  );
}
