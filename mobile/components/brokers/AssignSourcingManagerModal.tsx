import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { authClient } from '@/lib/auth-client';

interface AssignSourcingManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  brokerId: string;
  brokerName: string;
  currentSourcingManagerId?: string | null;
  onSuccess: () => void;
}

interface SourcingManager {
  id: string;
  name: string;
  email: string;
}

export function AssignSourcingManagerModal({
  isOpen,
  onClose,
  brokerId,
  brokerName,
  currentSourcingManagerId,
  onSuccess
}: AssignSourcingManagerModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [managers, setManagers] = useState<SourcingManager[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(currentSourcingManagerId || null);

  useEffect(() => {
    if (isOpen) {
      setSelectedId(currentSourcingManagerId || null);
      loadManagers();
    }
  }, [isOpen, currentSourcingManagerId]);

  const loadManagers = async () => {
    try {
      setFetching(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
      const res = await authClient.$fetch(`${baseUrl}/api/brokers/sourcing-managers`);
      if (res.data) {
        setManagers(res.data as SourcingManager[]);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load sourcing managers');
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
      const res = await authClient.$fetch(`${baseUrl}/api/brokers/${brokerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: { sourcingManagerId: selectedId || '' } // Send empty string for unassign
      });
      if (!res.error) {
        onSuccess();
        onClose();
      } else {
        throw new Error(res.error.message || 'Failed to assign');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-slate-100 bg-white shadow-sm z-10">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={onClose} className="p-2 mr-2 bg-slate-50 rounded-full">
              <Feather name="x" size={20} color="#64748b" />
            </TouchableOpacity>
            <View>
              <Text className="text-lg font-bold text-slate-900">Assign Sourcing Manager</Text>
              <Text className="text-sm text-slate-500">{brokerName}</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={loading || fetching}
            className={`bg-indigo-600 px-4 py-2 rounded-full flex-row items-center ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? <ActivityIndicator size="small" color="white" /> : <Text className="text-white font-bold">Save</Text>}
          </TouchableOpacity>
        </View>

        {/* Content */}
        {fetching ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text className="text-slate-500 mt-4">Loading managers...</Text>
          </View>
        ) : (
          <ScrollView className="flex-1 bg-slate-50 p-4">
            <View className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 mb-6">
              
              <TouchableOpacity
                onPress={() => setSelectedId(null)}
                className={`flex-row items-center p-4 border-b border-slate-100 ${selectedId === null ? 'bg-red-50' : ''}`}
              >
                <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3">
                  <Feather name="user-x" size={18} color="#ef4444" />
                </View>
                <View className="flex-1">
                  <Text className={`font-bold ${selectedId === null ? 'text-red-700' : 'text-slate-700'}`}>
                    Unassigned
                  </Text>
                  <Text className="text-xs text-slate-500">Remove current assignment</Text>
                </View>
                {selectedId === null && <Feather name="check-circle" size={20} color="#ef4444" />}
              </TouchableOpacity>

              {managers.map((manager, index) => {
                const isSelected = selectedId === manager.id;
                const isLast = index === managers.length - 1;
                return (
                  <TouchableOpacity
                    key={manager.id}
                    onPress={() => setSelectedId(manager.id)}
                    className={`flex-row items-center p-4 ${!isLast ? 'border-b border-slate-100' : ''} ${isSelected ? 'bg-indigo-50' : ''}`}
                  >
                    <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center mr-3">
                      <Feather name="user" size={18} color="#4f46e5" />
                    </View>
                    <View className="flex-1">
                      <Text className={`font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                        {manager.name}
                      </Text>
                      <Text className="text-xs text-slate-500">{manager.email}</Text>
                    </View>
                    {isSelected && <Feather name="check-circle" size={20} color="#4f46e5" />}
                  </TouchableOpacity>
                );
              })}
              
              {managers.length === 0 && (
                <View className="p-8 items-center justify-center">
                  <Text className="text-slate-500">No Sourcing Managers found</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}
