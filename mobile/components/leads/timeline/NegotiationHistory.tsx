import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import NegotiationAddForm from './NegotiationAddForm';
import NegotiationTimeline from './NegotiationTimeline';
import { authClient } from '@/lib/auth-client';

interface NegotiationHistoryProps {
  notes: any[];
  leadId?: string;
  onRefresh?: () => void;
}

export default function NegotiationHistory({ notes, leadId, onRefresh }: NegotiationHistoryProps) {
  const negotiationNotes = notes?.filter((n: any) => n.noteType === 'NEGOTIATION') || [];
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    askingPrice: '',
    offeredPrice: '',
    objections: '',
    strategy: '',
    nextStep: ''
  });

  const handleAddRound = async () => {
    if (!leadId) return;
    setSaving(true);
    try {
      const { data: sessionData } = await authClient.getSession();
      const userId = sessionData?.user?.id;
      if (!userId) {
        Alert.alert('Error', 'You must be logged in.');
        setSaving(false);
        return;
      }

      const contentObj = {
        title: form.title.trim() || `Round ${negotiationNotes.length + 1}`,
        askingPrice: form.askingPrice,
        offeredPrice: form.offeredPrice,
        objections: form.objections,
        strategy: form.strategy,
        nextStep: form.nextStep,
      };

      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { error } = await authClient.$fetch(`/api/leads/${leadId}/notes`, {
        baseURL,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          content: JSON.stringify(contentObj),
          userId,
          noteType: 'NEGOTIATION'
        },
      });

      if (!error) {
        setShowForm(false);
        setForm({
          title: '',
          askingPrice: '',
          offeredPrice: '',
          objections: '',
          strategy: '',
          nextStep: ''
        });
        if (onRefresh) onRefresh();
      } else {
        Alert.alert('Error', 'Failed to add negotiation round.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
      <View className="p-4 border-b border-gray-100 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-indigo-50 items-center justify-center border border-indigo-100">
            <FontAwesome5 name="handshake" size={18} color="#4f46e5" />
          </View>
          <View>
            <Text className="text-lg font-bold text-gray-900">Negotiation</Text>
            <Text className="text-xs text-gray-500 font-medium">
              {negotiationNotes.length} round{negotiationNotes.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setShowForm(!showForm)}
          className="bg-indigo-50 px-3 py-2 rounded-xl flex-row items-center border border-indigo-100"
        >
          <Feather name="plus" size={14} color="#4f46e5" />
          <Text className="text-indigo-700 text-xs font-bold ml-1">Add Round</Text>
        </TouchableOpacity>
      </View>

      <View className="p-4">
        {showForm && (
          <NegotiationAddForm
            form={form}
            setForm={setForm}
            saving={saving}
            handleAddRound={handleAddRound}
            onCancel={() => setShowForm(false)}
          />
        )}
        <NegotiationTimeline negotiationNotes={negotiationNotes} />
      </View>
    </View>
  );
}
