import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle, Clock } from 'lucide-react-native';

interface PipelineCardWrapperProps {
  title: string;
  statusKey: string;
  description: string;
  children: React.ReactNode;
  leadStatus: string;
  leadSubStatus: string;
  saving: boolean;
  handleMarkStageDone: (status: string, subStatus: string) => void;
  icon?: React.ReactNode;
}

export function PipelineCardWrapper({
  title,
  statusKey,
  description,
  children,
  leadStatus,
  leadSubStatus,
  saving,
  handleMarkStageDone,
  icon
}: PipelineCardWrapperProps) {
  const stages = ['BOOKING', 'DOCUMENT', 'LOAN', 'AGREEMENT', 'HANDOVER'];
  const currentIdx = stages.indexOf(leadStatus);
  const thisIdx = stages.indexOf(statusKey);
  const isPast = currentIdx > thisIdx;
  const isCurrent = currentIdx === thisIdx;
  const isDone = isPast || (isCurrent && leadSubStatus === 'DONE');
  const isLocked = currentIdx < thisIdx;

  if (isLocked) {
    return (
      <View className="bg-white rounded-2xl border border-gray-200 shadow-sm opacity-60 mb-4 overflow-hidden pointer-events-none">
        <View className="p-4 flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-gray-50/80 items-center justify-center border border-gray-100/50">
            {icon}
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900 text-base">{title}</Text>
            <Text className="text-xs text-gray-400 font-medium">Locked until previous stage completes</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={`bg-white rounded-2xl border ${isDone ? 'border-emerald-200' : 'border-indigo-200'} mb-4 shadow-sm overflow-hidden`}>
      <View className="p-4 border-b border-gray-100 flex-row items-center gap-3">
        <View className={`w-10 h-10 rounded-xl items-center justify-center border ${isDone ? 'bg-emerald-50/80 border-emerald-100/50' : 'bg-indigo-50/80 border-indigo-100/50'}`}>
          {isDone ? <CheckCircle size={20} color="#059669" /> : icon}
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-gray-900 text-base">{title}</Text>
          <View className="flex-row items-center gap-1 mt-0.5">
            {isDone ? (
              <>
                <CheckCircle size={14} color="#059669" />
                <Text className="text-xs font-medium text-emerald-600">Completed</Text>
              </>
            ) : (
              <>
                <Clock size={14} color="#4f46e5" />
                <Text className="text-xs font-medium text-indigo-600">In Progress</Text>
              </>
            )}
          </View>
        </View>
        {isCurrent && !isDone && (
          <TouchableOpacity
            onPress={() => handleMarkStageDone(statusKey, 'DONE')}
            disabled={saving}
            className={`px-4 py-2 rounded-xl bg-indigo-600 ${saving ? 'opacity-50' : ''}`}
          >
            <Text className="text-white font-medium text-sm">
              {saving ? 'Saving...' : 'Mark Done'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {(!isLocked) && (
         <View className="p-4 bg-gray-50/30">
           {isCurrent && !isDone && <Text className="text-sm font-medium text-gray-600 mb-4">{description}</Text>}
           {children}
         </View>
      )}
    </View>
  );
}
