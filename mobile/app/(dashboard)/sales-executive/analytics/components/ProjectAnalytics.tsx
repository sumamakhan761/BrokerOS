import React from 'react';
import { View, Text } from 'react-native';

export function ProjectAnalytics({ projectData }: { projectData: any }) {
  if (!projectData) return null;

  const renderList = (title: string, data: any[], color: string) => {
    const maxVal = Math.max(...(data || []).map((d: any) => d.value), 1);
    
    return (
      <View className="mb-6">
        <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{title}</Text>
        {data && data.length > 0 ? (
          <View className="gap-3">
            {data.map((item, idx) => (
              <View key={idx}>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-xs font-medium text-slate-700">{item.name}</Text>
                  <Text className="text-xs font-bold text-slate-900">{item.value}</Text>
                </View>
                <View className="h-2 bg-slate-100 rounded-full w-full overflow-hidden">
                  <View 
                    className={`h-full rounded-full ${color}`} 
                    style={{ width: `${(item.value / maxVal) * 100}%` }} 
                  />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-xs font-medium text-slate-400">No data available.</Text>
        )}
      </View>
    );
  };

  return (
    <View className="px-6 mb-8">
      <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <Text className="text-lg font-bold text-slate-800 mb-6">Project Trends</Text>
        
        {renderList("Most Visited", projectData.mostVisited, "bg-blue-400")}
        {renderList("Most Booked", projectData.mostBooked, "bg-emerald-500")}
        {renderList("Customer Interest", projectData.customerInterest, "bg-yellow-400")}
      </View>
    </View>
  );
}
