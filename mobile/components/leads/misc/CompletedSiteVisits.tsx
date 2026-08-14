import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import SiteVisitRow from './SiteVisitRow';
import { authClient } from '@/lib/auth-client';

export default function CompletedSiteVisits({ siteVisits, onRefresh }: { siteVisits: any[], onRefresh?: () => void }) {
  const completedVisits = siteVisits?.filter(
    (sv: any) => sv.status === 'COMPLETED' || sv.completedAt
  ) || [];

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<any>({
    interestLevel: '',
    budgetConfirmed: '',
    configInterest: '',
    customerReaction: '',
    closingProbability: '',
    nextAction: '',
    customerObjections: '',
    meetingNotes: ''
  });

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const startEdit = (sv: any) => {
    setEditForm({
      interestLevel: sv.interestLevel || '',
      budgetConfirmed: sv.budgetConfirmed?.toString() || '',
      configInterest: sv.configInterest || '',
      customerReaction: sv.customerReaction || '',
      closingProbability: sv.closingProbability || '',
      nextAction: sv.nextAction || '',
      customerObjections: sv.customerObjections || '',
      meetingNotes: sv.meetingNotes || ''
    });
    setEditingId(sv.id);
    setExpandedId(sv.id);
  };

  const saveEdit = async (svId: string) => {
    setSaving(true);
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const payload = {
        interestLevel: editForm.interestLevel || undefined,
        budgetConfirmed: editForm.budgetConfirmed ? Number(editForm.budgetConfirmed) : undefined,
        configInterest: editForm.configInterest,
        customerReaction: editForm.customerReaction,
        customerObjections: editForm.customerObjections,
        closingProbability: editForm.closingProbability,
        meetingNotes: editForm.meetingNotes,
        nextAction: editForm.nextAction,
      };

      const { error } = await authClient.$fetch(`/api/leads/site-visits/${svId}`, {
        baseURL,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });

      if (!error) {
        setEditingId(null);
        if (onRefresh) onRefresh();
      } else {
        Alert.alert('Error', 'Failed to update site visit');
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
      <View className="p-4 border-b border-gray-100 flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center border border-emerald-100">
          <Feather name="check-circle" size={20} color="#059669" />
        </View>
        <View>
          <Text className="text-lg font-bold text-gray-900">Site Visits Completed</Text>
          <Text className="text-xs text-gray-500 font-medium">
            {completedVisits.length} completed visit{completedVisits.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View className="p-4 space-y-4">
        {completedVisits.length === 0 ? (
          <View className="items-center py-6">
            <Feather name="check-circle" size={32} color="#cbd5e1" style={{ marginBottom: 10 }} />
            <Text className="text-sm font-medium text-gray-500">No completed site visits yet</Text>
          </View>
        ) : (
          completedVisits.map((sv: any) => (
            <SiteVisitRow
              key={sv.id}
              sv={sv}
              expandedId={expandedId}
              toggleExpand={toggleExpand}
              editingId={editingId}
              setEditingId={setEditingId}
              editForm={editForm}
              setEditForm={setEditForm}
              saving={saving}
              startEdit={startEdit}
              saveEdit={saveEdit}
            />
          ))
        )}
      </View>
    </View>
  );
}
