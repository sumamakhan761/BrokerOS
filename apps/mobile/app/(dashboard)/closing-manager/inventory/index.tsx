import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { authClient } from '../../../../lib/auth-client';

export default function ClosingManagerInventoryIndex() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
      // Closing Manager gets CP projects
      const { data, error } = await authClient.$fetch<any[]>('/api/inventory/projects?isCpProject=true', { baseURL: baseUrl });

      if (error) {
        throw new Error(error.message || "Failed to fetch projects");
      }

      setProjects(data || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="text-slate-500 mt-4 font-medium">Loading inventory...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="p-6 pt-12 bg-white border-b border-slate-200">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-slate-900">Project Inventory</Text>
            <Text className="text-sm text-slate-500 mt-1">View your assigned projects and manage units.</Text>
          </View>
        </View>
      </View>

      {error ? (
        <View className="m-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <Text className="text-rose-700 font-medium">{error}</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View className="h-4" />}
          ListEmptyComponent={
            <View className="py-20 items-center justify-center bg-white rounded-2xl border border-slate-200 border-dashed">
              <Feather name="box" size={48} color="#cbd5e1" />
              <Text className="text-lg font-bold text-slate-900 mt-4">No Assigned Projects</Text>
              <Text className="text-slate-500 text-center mt-2 px-8">You haven't been assigned to any projects by the Channel Partner yet.</Text>
            </View>
          }
          renderItem={({ item: project }) => (
            <TouchableOpacity
              onPress={() => router.push(`/(dashboard)/closing-manager/inventory/${project.id}` as any)}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
              activeOpacity={0.7}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="w-12 h-12 bg-indigo-50 rounded-xl items-center justify-center">
                  <Feather name="layout" size={24} color="#4f46e5" />
                </View>
                <View className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                  <Text className="text-emerald-700 text-xs font-bold">Active</Text>
                </View>
              </View>

              <Text className="text-xl font-bold text-slate-900 mb-1">{project.name}</Text>
              {project.builder && (
                <View className="flex-row items-center mt-1">
                  <Feather name="map-pin" size={12} color="#64748b" />
                  <Text className="text-slate-500 text-sm ml-1.5">{project.builder.name}</Text>
                </View>
              )}

              <View className="mt-4 pt-4 border-t border-slate-100 flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Feather name="grid" size={14} color="#94a3b8" />
                  <Text className="text-slate-600 text-sm font-semibold ml-1.5">
                    {project._count?.towers || 0} Towers
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-indigo-600 font-bold mr-1">View Grid</Text>
                  <Feather name="chevron-right" size={16} color="#4f46e5" />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
