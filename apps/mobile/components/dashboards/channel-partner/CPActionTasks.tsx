import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, PhoneCall, AlertCircle, ArrowRight, Key } from 'lucide-react-native';
import { useRouter } from 'expo-router';

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(dateString));
}

export function CPActionTasks({ tasks }: { tasks: any[] }) {
  const router = useRouter();

  if (!tasks || tasks.length === 0) {
    return (
      <View className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6 items-center justify-center min-h-[200px]">
        <View className="w-16 h-16 bg-slate-50 rounded-full items-center justify-center mb-4">
          <AlertCircle size={32} color="#cbd5e1" />
        </View>
        <Text className="text-lg font-bold text-slate-700">All Caught Up!</Text>
        <Text className="text-sm text-slate-500 text-center mt-2">
          No pending follow-ups, site visits, or handovers in your broker network.
        </Text>
      </View>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'FOLLOW_UP': return <PhoneCall size={20} color="#3b82f6" />;
      case 'SITE_VISIT': return <Calendar size={20} color="#a855f7" />;
      case 'HANDOVER': return <Key size={20} color="#f59e0b" />;
      default: return <AlertCircle size={20} color="#64748b" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'FOLLOW_UP': return 'bg-blue-50';
      case 'SITE_VISIT': return 'bg-purple-50';
      case 'HANDOVER': return 'bg-amber-50';
      default: return 'bg-slate-50';
    }
  };

  const handlePress = (task: any) => {
    if (task.leadId) {
      router.push(`/channel-partner/customer-management/${task.leadId}`);
    } else if (task.brokerId) {
      router.push(`/channel-partner/broker-management/${task.brokerId}`);
    }
  };

  return (
    <View className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-xl font-bold text-slate-900">Broker Network Action Feed</Text>
        <View className="bg-indigo-100 px-3 py-1.5 rounded-full">
          <Text className="text-indigo-600 text-xs font-bold">{tasks.length} Pending</Text>
        </View>
      </View>

      <View className="space-y-4">
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            onPress={() => handlePress(task)}
            className="flex-row items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm mb-4"
          >
            <View className="flex-row items-center flex-1">
              <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${getBg(task.type)}`}>
                {getIcon(task.type)}
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-900 text-sm mb-1">{task.title}</Text>
                <Text className="text-xs text-slate-500 font-medium">
                  {formatDate(task.date)}
                </Text>
                {task.metadata && task.metadata.project && (
                  <View className="bg-indigo-50 self-start px-2 py-0.5 rounded-md mt-2">
                    <Text className="text-xs text-indigo-500 font-bold">
                      {task.metadata.project}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View className="p-2 rounded-xl bg-slate-50 ml-2">
              <ArrowRight size={16} color="#94a3b8" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
