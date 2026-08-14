import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { authClient } from '../../../../lib/auth-client';
import NewProjectModal from '../../../../components/inventory/modals/NewProjectModal';
import PossessionModal from '../../../../components/inventory/modals/PossessionModal';
import AssignmentModal from '../../../../components/inventory/modals/AssignmentModal';

export default function ChannelPartnerInventoryIndex() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  const [possessionModal, setPossessionModal] = useState({ isOpen: false, projectId: '', projectName: '', initialStatus: '', initialTimeline: undefined });
  const [assignmentModal, setAssignmentModal] = useState({ isOpen: false, projectId: '', projectName: '' });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
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
      <View className="p-6 pt-12 bg-white border-b border-slate-200 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-slate-900">Project Inventory</Text>
          <Text className="text-sm text-slate-500 mt-1">Manage your channel partner projects.</Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsNewProjectModalOpen(true)}
          className="bg-indigo-600 w-10 h-10 rounded-full items-center justify-center shadow-sm"
        >
          <Feather name="plus" size={20} color="white" />
        </TouchableOpacity>
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
              <Text className="text-lg font-bold text-slate-900 mt-4">No Projects Yet</Text>
              <Text className="text-slate-500 text-center mt-2 px-8">Create your first channel partner project to get started.</Text>
            </View>
          }
          renderItem={({ item: project }) => (
            <TouchableOpacity
              onPress={() => router.push(`/(dashboard)/channel-partner/inventory/${project.id}` as any)}
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

              <View className="mt-4 pt-4 border-t border-slate-100 flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <Feather name="grid" size={14} color="#94a3b8" />
                  <Text className="text-slate-600 text-sm font-semibold ml-1.5">
                    {project._count?.towers || 0} Towers
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-indigo-600 font-bold mr-1">Manage</Text>
                  <Feather name="chevron-right" size={16} color="#4f46e5" />
                </View>
              </View>

              <View className="flex-row gap-2 mt-2">
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setPossessionModal({
                      isOpen: true,
                      projectId: project.id,
                      projectName: project.name,
                      initialStatus: project.constructionStatus,
                      initialTimeline: project.possessionTimeline
                    });
                  }}
                  className="flex-1 bg-indigo-50 py-2 rounded-lg items-center border border-indigo-100"
                >
                  <Text className="text-indigo-700 text-xs font-bold">Set Possession</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setAssignmentModal({
                      isOpen: true,
                      projectId: project.id,
                      projectName: project.name
                    });
                  }}
                  className="flex-1 bg-emerald-50 py-2 rounded-lg items-center border border-emerald-100"
                >
                  <Text className="text-emerald-700 text-xs font-bold">Assign Project</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <NewProjectModal
        isVisible={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSuccess={loadProjects}
        isCpProject={true}
      />

      <PossessionModal
        isOpen={possessionModal.isOpen}
        onClose={() => setPossessionModal(prev => ({ ...prev, isOpen: false }))}
        entityId={possessionModal.projectId}
        entityType="project"
        entityName={possessionModal.projectName}
        initialStatus={possessionModal.initialStatus as any}
        initialTimeline={possessionModal.initialTimeline}
        onSuccess={() => {
          loadProjects();
        }}
      />

      <AssignmentModal
        isOpen={assignmentModal.isOpen}
        onClose={() => setAssignmentModal(prev => ({ ...prev, isOpen: false }))}
        entityId={assignmentModal.projectId}
        entityType="project"
        entityName={assignmentModal.projectName}
        onSuccess={() => {
          loadProjects();
        }}
      />
    </View>
  );
}
