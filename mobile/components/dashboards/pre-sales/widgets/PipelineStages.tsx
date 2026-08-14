import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DashboardData } from '../misc/types';
import { PIPELINE_STAGES } from '../misc/constants';

interface PipelineStagesProps {
  pipeline: DashboardData['pipeline'];
  maxPipeline: number;
}

export default function PipelineStages({ pipeline, maxPipeline }: PipelineStagesProps) {
  return (
    <View className="mb-2 mt-2">
      <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Pipeline Stages</Text>
      <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm shadow-slate-200/50 mb-1">
        {PIPELINE_STAGES.map((stage, i) => {
          const count = pipeline[stage.key] || 0;
          const barPct = count / maxPipeline;
          return (
            <View key={stage.key} className={i === PIPELINE_STAGES.length - 1 ? "" : "mb-4"}>
              <View className="flex-row justify-between mb-1.5">
                <Text className="text-xs font-medium text-slate-500">{stage.label}</Text>
                <Text className="text-xs font-bold text-slate-900">{count}</Text>
              </View>
              <View className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <View style={{ width: `${barPct * 100}%`, backgroundColor: stage.color }} className="h-full rounded-full" />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
