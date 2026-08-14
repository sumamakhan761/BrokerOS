import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { authClient } from '../../lib/auth-client';

export function BrokerDealSection({ broker, onRefresh }: { broker: any, onRefresh?: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    projectId: '',
    brokeragePercent: '',
    brokerageFlat: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdding && projects.length === 0) {
      loadProjects();
    }
  }, [isAdding]);

  const loadProjects = async () => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      const res = await authClient.$fetch('/api/inventory/projects?isCpProject=true', { baseURL: baseUrl });
      if (res.data) setProjects(res.data as any[]);
    } catch (e) {
      console.log('Failed to load projects');
    }
  };

  const handleSave = async () => {
    if (!formData.projectId) {
      Alert.alert('Error', 'Please select a project');
      return;
    }
    setLoading(true);
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      const res = await authClient.$fetch(`/api/brokers/${broker.id}/deal`, {
        baseURL: baseUrl,
        method: 'POST',
        body: formData
      });
      if (res.error) throw new Error(res.error.message);
      
      setIsAdding(false);
      setFormData({ projectId: '', brokeragePercent: '', brokerageFlat: '' });
      if (onRefresh) onRefresh();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save deal');
    } finally {
      setLoading(false);
    }
  };

  if (!broker) return null;

  const assignments = broker.projectAssignments || [];

  return (
    <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mt-4">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center mr-3">
            <Feather name="briefcase" size={20} color="#4f46e5" />
          </View>
          <Text className="text-lg font-bold text-slate-900">Deal Cards</Text>
        </View>
        
        {broker.status === 'DEAL' && !isAdding && (
          <TouchableOpacity onPress={() => setIsAdding(true)} className="p-2 bg-indigo-600 rounded-full">
            <Feather name="plus" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {broker.status !== 'DEAL' && (
        <View className="bg-amber-50 p-3 rounded-lg border border-amber-200 mb-4">
          <Text className="text-amber-800 text-sm">To add a Deal Card, the broker's status must be set to DEAL.</Text>
        </View>
      )}

      {isAdding && (
        <View className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
          <Text className="text-sm font-bold text-slate-700 mb-1.5">Select Project</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {projects.map(p => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setFormData({ ...formData, projectId: p.id })}
                className={`px-4 py-2 rounded-lg mr-2 border ${formData.projectId === p.id ? 'bg-indigo-100 border-indigo-300' : 'bg-white border-slate-200'}`}
              >
                <Text className={formData.projectId === p.id ? 'text-indigo-700 font-bold' : 'text-slate-600'}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text className="text-sm font-bold text-slate-700 mb-1.5">Brokerage % (Optional)</Text>
          <TextInput
            value={formData.brokeragePercent}
            onChangeText={v => setFormData({ ...formData, brokeragePercent: v })}
            keyboardType="numeric"
            placeholder="e.g. 2.5"
            className="bg-white border border-slate-200 p-3 rounded-xl mb-4 text-slate-900"
          />

          <Text className="text-sm font-bold text-slate-700 mb-1.5">Flat Amount (Optional)</Text>
          <TextInput
            value={formData.brokerageFlat}
            onChangeText={v => setFormData({ ...formData, brokerageFlat: v })}
            keyboardType="numeric"
            placeholder="e.g. 50000"
            className="bg-white border border-slate-200 p-3 rounded-xl mb-4 text-slate-900"
          />

          <View className="flex-row gap-2 mt-2">
            <TouchableOpacity onPress={() => setIsAdding(false)} className="flex-1 p-3 bg-white border border-slate-300 rounded-xl items-center">
              <Text className="text-slate-600 font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} disabled={loading} className="flex-1 p-3 bg-indigo-600 rounded-xl items-center flex-row justify-center">
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text className="text-white font-bold">Save Deal</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {assignments.length === 0 ? (
        <View className="items-center justify-center py-6 border-t border-slate-100">
          <Feather name="folder-minus" size={32} color="#cbd5e1" />
          <Text className="text-slate-500 mt-2 font-medium">No active deals right now.</Text>
        </View>
      ) : (
        <View className="border-t border-slate-100 pt-4 space-y-3">
          {assignments.map((assignment: any) => (
            <View key={assignment.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
              <View className="flex-row justify-between mb-2">
                <Text className="font-bold text-slate-900 text-base">{assignment.project?.name}</Text>
                {assignment.isLocked && <Feather name="lock" size={14} color="#f59e0b" />}
              </View>
              <View className="flex-row gap-4 mt-2">
                {assignment.brokeragePercent && (
                  <View>
                    <Text className="text-xs text-slate-500">Percentage</Text>
                    <Text className="font-bold text-slate-700">{assignment.brokeragePercent}%</Text>
                  </View>
                )}
                {assignment.brokerageFlat && (
                  <View>
                    <Text className="text-xs text-slate-500">Flat Amt</Text>
                    <Text className="font-bold text-slate-700">₹{assignment.brokerageFlat}</Text>
                  </View>
                )}
                {!assignment.brokeragePercent && !assignment.brokerageFlat && (
                  <Text className="text-xs text-slate-500 italic">No specific terms set</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
