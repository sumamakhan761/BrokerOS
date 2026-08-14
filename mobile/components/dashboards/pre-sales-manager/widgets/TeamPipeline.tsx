import React from 'react';
import { View, Text } from 'react-native';
import { BarChart2 } from 'lucide-react-native';

const PIPELINE_STAGES = [
  { key: 'NEW', label: 'New Lead', color: '#6366f1' },
  { key: 'CONTACTED', label: 'Contacted', color: '#8b5cf6' },
  { key: 'INTERESTED', label: 'Interested', color: '#a78bfa' },
  { key: 'QUALIFIED', label: 'Qualified', color: '#7c3aed' },
  { key: 'SITE_VISIT_SCHEDULED', label: 'Visit Sched.', color: '#4f46e5' },
  { key: 'SITE_VISIT_COMPLETED', label: 'Visit Done', color: '#4338ca' },
  { key: 'BOOKING', label: 'Booking', color: '#3730a3' },
  { key: 'LOST', label: 'Lost', color: '#9ca3af' },
];

export function TeamPipeline({ pipeline }: { pipeline: Record<string, number> }) {
  return (
    <View className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
      <View className="flex-row items-center gap-2 mb-4">
        <View className="bg-indigo-50 p-2 rounded-lg">
          <BarChart2 size={20} className="text-indigo-600" />
        </View>
        <Text className="text-sm font-bold text-slate-500 uppercase tracking-wider">Team Pipeline Distribution</Text>
      </View>
      <View className="gap-3">
        {PIPELINE_STAGES.map((stage) => {
          const maxPipeline = Math.max(1, ...Object.values(pipeline));
          const count = pipeline[stage.key] || 0;
          const barPct = count / maxPipeline;
          return (
            <View key={stage.key}>
              <View className="flex-row justify-between mb-1.5">
                <Text className="text-xs font-semibold text-slate-600">{stage.label}</Text>
                <Text className="text-xs font-bold text-slate-900">{count}</Text>
              </View>
              <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <View style={{ height: '100%', width: `${barPct * 100}%`, backgroundColor: stage.color, borderRadius: 3 }} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
