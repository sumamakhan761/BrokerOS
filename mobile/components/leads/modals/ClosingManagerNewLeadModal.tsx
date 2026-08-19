import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { authClient } from '../../../lib/auth-client';
import { Picker } from '@react-native-picker/picker';

interface ClosingManagerNewLeadModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClosingManagerNewLeadModal({ isVisible, onClose, onSuccess }: ClosingManagerNewLeadModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    interestedProjectId: '',
    interestedTowerId: '',
    interestedUnitId: '',
    brokerId: '',
  });

  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [towers, setTowers] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [brokers, setBrokers] = useState<any[]>([]);

  useEffect(() => {
    if (isVisible) {
      fetchProjects();
    }
  }, [isVisible]);

  useEffect(() => {
    if (formData.interestedProjectId) {
      fetchTowers(formData.interestedProjectId);
      fetchBrokers(formData.interestedProjectId);
    } else {
      setTowers([]);
      setBrokers([]);
      setFormData(prev => ({ ...prev, interestedTowerId: '', interestedUnitId: '', brokerId: '' }));
    }
  }, [formData.interestedProjectId]);

  useEffect(() => {
    if (formData.interestedTowerId) {
      fetchUnits(formData.interestedTowerId);
    } else {
      setUnits([]);
      setFormData(prev => ({ ...prev, interestedUnitId: '' }));
    }
  }, [formData.interestedTowerId]);

  const fetchProjects = async () => {
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { data, error } = await authClient.$fetch<any[]>(`/api/inventory/projects?isCpProject=true`, { baseURL });
      if (!error) setProjects(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTowers = async (projectId: string) => {
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { data, error } = await authClient.$fetch<any[]>(`/api/inventory/projects/${projectId}/towers`, { baseURL });
      if (!error) setTowers(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUnits = (towerId: string) => {
    try {
      const tower = towers.find((t: any) => t.id === towerId);
      if (!tower) return;
      const allUnits = tower.floors?.flatMap((f: any) => f.units) || [];
      setUnits(allUnits);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBrokers = async (projectId: string) => {
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { data, error } = await authClient.$fetch<any[]>(`/api/brokers?projectId=${projectId}`, { baseURL });
      if (!error) setBrokers(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.phone || !formData.interestedProjectId || !formData.brokerId) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill in all required fields (First Name, Phone, Project, Broker).' });
      return;
    }

    setLoading(true);
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { error } = await authClient.$fetch(`/api/leads`, {
        baseURL,
        method: 'POST',
        body: formData,
      });
      if (error) throw error;

      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        interestedProjectId: '',
        interestedTowerId: '',
        interestedUnitId: '',
        brokerId: '',
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create lead:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to create lead' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-slate-900/40 justify-end">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="bg-white rounded-t-3xl w-full max-h-[90%]"
        >
          <View className="flex-row justify-between items-center p-5 border-b border-slate-100">
            <Text className="text-xl font-bold text-slate-900">New Broker Lead</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 rounded-full">
              <Feather name="x" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-slate-700 mb-1">First Name *</Text>
                <TextInput
                  value={formData.firstName}
                  onChangeText={(val) => setFormData({ ...formData, firstName: val })}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                  placeholder="John"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-slate-700 mb-1">Last Name</Text>
                <TextInput
                  value={formData.lastName}
                  onChangeText={(val) => setFormData({ ...formData, lastName: val })}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                  placeholder="Doe"
                />
              </View>
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-slate-700 mb-1">Phone Number *</Text>
                <TextInput
                  value={formData.phone}
                  onChangeText={(val) => setFormData({ ...formData, phone: val })}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                  placeholder="+91..."
                  keyboardType="phone-pad"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-slate-700 mb-1">Email</Text>
                <TextInput
                  value={formData.email}
                  onChangeText={(val) => setFormData({ ...formData, email: val })}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                  placeholder="john@example.com"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <Text className="text-sm font-semibold text-slate-700 mb-1 mt-2">Project Interest *</Text>
            <View className="bg-slate-50 border border-slate-200 rounded-xl mb-4 overflow-hidden">
              <Picker
                selectedValue={formData.interestedProjectId}
                onValueChange={(val) => setFormData({ ...formData, interestedProjectId: val })}
              >
                <Picker.Item label="Select Project..." value="" color="#94a3b8" />
                {projects.map((p) => (
                  <Picker.Item key={p.id} label={p.name} value={p.id} />
                ))}
              </Picker>
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-slate-700 mb-1">Tower</Text>
                <View className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                  <Picker
                    selectedValue={formData.interestedTowerId}
                    onValueChange={(val) => setFormData({ ...formData, interestedTowerId: val })}
                    enabled={!!formData.interestedProjectId}
                  >
                    <Picker.Item label="Select Tower..." value="" color="#94a3b8" />
                    {towers.map((t) => (
                      <Picker.Item key={t.id} label={t.name} value={t.id} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-slate-700 mb-1">Unit</Text>
                <View className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                  <Picker
                    selectedValue={formData.interestedUnitId}
                    onValueChange={(val) => setFormData({ ...formData, interestedUnitId: val })}
                    enabled={!!formData.interestedTowerId}
                  >
                    <Picker.Item label="Select Unit..." value="" color="#94a3b8" />
                    {units.map((u) => (
                      <Picker.Item key={u.id} label={u.unitNumber} value={u.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <Text className="text-sm font-semibold text-slate-700 mb-1 mt-2">Attached Broker *</Text>
            <View className="bg-slate-50 border border-slate-200 rounded-xl mb-1 overflow-hidden">
              <Picker
                selectedValue={formData.brokerId}
                onValueChange={(val) => setFormData({ ...formData, brokerId: val })}
                enabled={!!formData.interestedProjectId}
              >
                <Picker.Item label="Select Broker..." value="" color="#94a3b8" />
                {brokers.map((b) => (
                  <Picker.Item key={b.id} label={`${b.name} (${b.brokerCode})`} value={b.id} />
                ))}
              </Picker>
            </View>
            <Text className="text-xs text-slate-400 mb-6 px-1">Only brokers assigned to the selected project are listed.</Text>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className={`py-4 rounded-xl items-center shadow-sm ${loading ? 'bg-indigo-300' : 'bg-indigo-600'}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Create Lead</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
