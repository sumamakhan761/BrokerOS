import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { DashboardData } from '../misc/types';

interface BacklogsSectionProps {
  backlogs: DashboardData['backlogs'];
  hasBacklog: boolean;
}

export default function BacklogsSection({ backlogs, hasBacklog }: BacklogsSectionProps) {
  return (
    <View className="mb-2 mt-2">
      <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Backlogs</Text>
      <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm shadow-slate-200/50 mb-1">
        {!hasBacklog ? (
          <View className="flex-row items-center justify-center py-5 gap-2">
            <CheckCircle size={16} color="#94a3b8" />
            <Text className="text-slate-400 text-sm font-medium">All caught up! No backlogs.</Text>
          </View>
        ) : (
          <View className="gap-3">
            {backlogs.coldCallBacklogCount > 0 && (
              <View className="bg-rose-50 rounded-2xl p-4 border border-rose-100/50">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-sm text-rose-900 font-bold tracking-tight">Cold Call Backlog</Text>
                  <View className="bg-rose-200 rounded-lg px-2.5 py-0.5">
                    <Text className="text-rose-900 text-xs font-bold">{backlogs.coldCallBacklogCount}</Text>
                  </View>
                </View>
                <Text className="text-xs text-rose-600 font-medium">Call {backlogs.coldCallBacklogCount} new lead(s) to clear</Text>
              </View>
            )}
            {backlogs.missedFollowUps.length > 0 && (
              <View className="bg-amber-50 rounded-2xl p-4 border border-amber-100/50">
                <View className="flex-row justify-between items-center mb-2.5">
                  <Text className="text-sm text-amber-900 font-bold tracking-tight">Missed Follow-ups</Text>
                  <View className="bg-amber-200 rounded-lg px-2.5 py-0.5">
                    <Text className="text-amber-900 text-xs font-bold">{backlogs.missedFollowUps.length}</Text>
                  </View>
                </View>
                {backlogs.missedFollowUps.slice(0, 3).map((fu, i) => (
                  <View key={fu.id} className={`flex-row justify-between py-2 ${i < 2 && i < backlogs.missedFollowUps.length - 1 ? 'border-b border-amber-100' : ''}`}>
                    <Text className="text-xs text-amber-700 font-medium">{fu.lead ? `${fu.lead.firstName} ${fu.lead.lastName || ''}`.trim() : '—'}</Text>
                    <Text className="text-[11px] text-amber-600 font-medium">
                      {new Date(fu.scheduledDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
