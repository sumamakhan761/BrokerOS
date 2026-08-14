import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { authClient } from '@/lib/auth-client';

interface Subordinate {
  id: string;
  name: string;
  email: string;
  role: { code: string; name: string };
}

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: 'project' | 'tower';
  entityName: string;
  onSuccess?: () => void;
}

export default function AssignmentModal({
  isOpen, onClose, entityId, entityType, entityName, onSuccess
}: AssignmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  const [sourcingManagers, setSourcingManagers] = useState<Subordinate[]>([]);
  const [closingManagers, setClosingManagers] = useState<Subordinate[]>([]);
  const [salesExecutives, setSalesExecutives] = useState<Subordinate[]>([]);
  
  const [selectedSMIds, setSelectedSMIds] = useState<string[]>([]);
  const [selectedCMIds, setSelectedCMIds] = useState<string[]>([]);
  const [selectedSEIds, setSelectedSEIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen, entityId, entityType]);

  const fetchData = async () => {
    try {
      setFetching(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
      
      const subRes = await authClient.$fetch(`${baseUrl}/api/users/subordinates`);
      if (subRes.error) throw new Error(subRes.error.message || 'Failed to fetch subordinates');
      
      const allSubordinates = subRes.data as Subordinate[];
      setSourcingManagers(allSubordinates.filter(s => s.role.code === "SOURCING_MANAGER"));
      setClosingManagers(allSubordinates.filter(s => s.role.code === "CLOSING_MANAGER"));
      setSalesExecutives(allSubordinates.filter(s => s.role.code === "SALES_EXECUTIVE"));

      let assignmentsUrl = entityType === "project" 
        ? `/api/inventory/projects/${entityId}/assignments`
        : `/api/inventory/projects/towers/${entityId}/assignments`;

      const assignRes = await authClient.$fetch(`${baseUrl}${assignmentsUrl}`);
      if (assignRes.error) throw new Error(assignRes.error.message || 'Failed to fetch assignments');
      
      const assignments = assignRes.data as any[];
      const smIds: string[] = [];
      const cmIds: string[] = [];
      const seIds: string[] = [];
      
      assignments.forEach((a: any) => {
        if (a.role === "SOURCING_MANAGER") smIds.push(a.userId);
        if (a.role === "CLOSING_MANAGER") cmIds.push(a.userId);
        if (a.role === "SALES_EXECUTIVE") seIds.push(a.userId);
      });
      
      setSelectedSMIds(smIds);
      setSelectedCMIds(cmIds);
      setSelectedSEIds(seIds);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong');
    } finally {
      setFetching(false);
    }
  };

  const toggleSelection = (id: string, roleCode: string) => {
    if (roleCode === 'SOURCING_MANAGER') {
      setSelectedSMIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else if (roleCode === 'CLOSING_MANAGER') {
      setSelectedCMIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else if (roleCode === 'SALES_EXECUTIVE') {
      setSelectedSEIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }
  };

  const handleAssign = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
      
      const endpoint = entityType === "project" 
        ? `/api/inventory/projects/${entityId}/assign`
        : `/api/inventory/projects/towers/${entityId}/assign`;

      const res = await authClient.$fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { 
          sourcingManagerIds: selectedSMIds,
          closingManagerIds: selectedCMIds,
          salesExecIds: selectedSEIds
        },
      });

      if (res.error) throw new Error(res.error.message || 'Failed to assign');
      onSuccess?.();
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderManagerList = (title: string, data: Subordinate[], selectedIds: string[], roleCode: string, themeColor: string) => {
    if (data.length === 0) return null;
    return (
      <View className="mb-4 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        <View className="bg-gray-100 border-b border-gray-200 px-4 py-3">
          <Text className="font-bold text-gray-800">{title}</Text>
        </View>
        <View className="p-2 max-h-60">
          <ScrollView nestedScrollEnabled>
            {data.map(user => {
              const isSelected = selectedIds.includes(user.id);
              return (
                <TouchableOpacity
                  key={user.id}
                  onPress={() => toggleSelection(user.id, roleCode)}
                  className={`flex-row items-center gap-3 p-3 rounded-lg mb-1 ${
                    isSelected ? `bg-${themeColor}-50 border border-${themeColor}-200` : 'border border-transparent hover:bg-gray-200'
                  }`}
                >
                  <View className={`w-5 h-5 rounded border items-center justify-center ${
                    isSelected ? `bg-${themeColor}-600 border-${themeColor}-600` : 'bg-white border-gray-300'
                  }`}>
                    {isSelected && <Feather name="check" size={12} color="white" />}
                  </View>
                  <View className="flex-1">
                    <Text className={`text-sm font-bold ${isSelected ? `text-${themeColor}-900` : 'text-gray-700'}`}>{user.name}</Text>
                    <Text className="text-xs text-gray-500" numberOfLines={1}>{user.email}</Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 shadow-xl max-h-[90%] flex-1">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center gap-2">
              <Feather name="user-plus" size={24} color="#4f46e5" />
              <Text className="text-xl font-bold text-gray-900">
                Assign {entityType === "project" ? "Project" : "Tower"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
              <Feather name="x" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-sm text-gray-500 font-medium mb-4">
            Assign multiple managers to <Text className="text-indigo-600 font-bold">{entityName}</Text>
          </Text>

          {fetching ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text className="text-gray-500 mt-4">Loading team...</Text>
            </View>
          ) : (
            <ScrollView className="flex-1 mb-4" showsVerticalScrollIndicator={false}>
              {sourcingManagers.length === 0 && closingManagers.length === 0 && salesExecutives.length === 0 ? (
                <View className="py-10 items-center justify-center">
                  <Feather name="users" size={40} color="#cbd5e1" />
                  <Text className="text-gray-500 mt-4 text-center">No eligible team members found in your organization.</Text>
                </View>
              ) : (
                <>
                  {renderManagerList("Sourcing Managers", sourcingManagers, selectedSMIds, "SOURCING_MANAGER", "indigo")}
                  {renderManagerList("Closing Managers", closingManagers, selectedCMIds, "CLOSING_MANAGER", "emerald")}
                  {renderManagerList("Sales Executives", salesExecutives, selectedSEIds, "SALES_EXECUTIVE", "blue")}
                </>
              )}
            </ScrollView>
          )}

          <View className="flex-row gap-3 pt-4 border-t border-gray-100">
            <TouchableOpacity 
              onPress={onClose}
              className="flex-1 py-4 bg-gray-100 rounded-xl items-center justify-center"
            >
              <Text className="text-gray-700 font-bold text-base">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleAssign}
              disabled={loading || fetching}
              className={`flex-[2] py-4 bg-indigo-600 rounded-xl items-center justify-center flex-row gap-2 ${
                (loading || fetching) ? 'opacity-50' : ''
              }`}
            >
              {loading ? <ActivityIndicator color="white" /> : <Feather name="check" size={18} color="white" />}
              <Text className="text-white font-bold text-base">Save Assignments</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
