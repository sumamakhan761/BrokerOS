import React from 'react';
import { View, Text } from 'react-native';
import { Users, UserPlus, UserCheck, UserX, Clock, PhoneMissed, MapPin, Percent } from 'lucide-react-native';

interface DashboardData {
  widgets: {
    totalLeads: number;
    newLeads: number;
    activeLeads: number;
    lostLeads: number;
    todayFollowUps: number;
    missedFollowUps: number;
    siteVisitsScheduled: number;
    conversionRate: number;
  };
}

export function WidgetsGrid({ dashData }: { dashData: DashboardData }) {
  const widgetData = [
    { label: 'Total Leads', val: dashData.widgets.totalLeads, accent: 'slate', icon: Users },
    { label: 'New Leads', val: dashData.widgets.newLeads, accent: 'indigo', icon: UserPlus },
    { label: 'Active Leads', val: dashData.widgets.activeLeads, accent: 'emerald', icon: UserCheck },
    { label: 'Lost Leads', val: dashData.widgets.lostLeads, accent: 'rose', icon: UserX },
    { label: 'Today F-Ups', val: dashData.widgets.todayFollowUps, accent: 'amber', icon: Clock },
    { label: 'Missed F-Ups', val: dashData.widgets.missedFollowUps, accent: 'rose', icon: PhoneMissed },
    { label: 'Site Visits', val: dashData.widgets.siteVisitsScheduled, accent: 'violet', icon: MapPin },
    { label: 'Conversion', val: dashData.widgets.conversionRate + '%', accent: 'sky', icon: Percent },
  ];

  const colors: Record<string, { bg: string, text: string }> = {
    slate: { bg: 'bg-slate-50', text: 'text-slate-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600' },
    sky: { bg: 'bg-sky-50', text: 'text-sky-600' },
  };

  return (
    <View className="flex-row flex-wrap justify-between gap-y-3">
      {widgetData.map((w, i) => {
        const Icon = w.icon;
        const color = colors[w.accent];
        return (
          <View key={i} className="w-[48%] bg-white border border-slate-100 shadow-sm rounded-2xl p-4">
            <View className={`w-8 h-8 rounded-full items-center justify-center mb-3 ${color.bg}`}>
              <Icon size={16} strokeWidth={2.5} className={color.text} />
            </View>
            <Text className="text-2xl font-extrabold text-slate-900">{w.val}</Text>
            <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{w.label}</Text>
          </View>
        );
      })}
    </View>
  );
}
