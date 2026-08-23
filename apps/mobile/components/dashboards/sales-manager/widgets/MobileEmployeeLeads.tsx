import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { authClient } from '../../../../lib/auth-client';

export default function MobileEmployeeLeads({ employeeId }: { employeeId: string }) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeads() {
      try {
        const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
        const res = await authClient.$fetch<any[]>(`/api/leads/employee/${employeeId}`, { baseURL: baseUrl });
        if (res.data) setLeads(res.data);
      } catch (e) {
        console.error('Failed to load leads', e);
      } finally {
        setLoading(false);
      }
    }
    loadLeads();
  }, [employeeId]);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <ActivityIndicator size="small" color="#6366f1" />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {leads.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: '#94a3b8' }}>No leads found.</Text>
        </View>
      ) : (
        leads.map(lead => (
          <View key={lead.id} style={[styles.card, { padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <View>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#0f172a', marginBottom: 4 }}>{lead.firstName} {lead.lastName}</Text>
              <Text style={{ color: '#64748b', fontSize: 12 }}>Score: {lead.score || 0}</Text>
              <Text style={{ color: '#64748b', fontSize: 12 }}>Follow-up: {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString() : 'None'}</Text>
            </View>
            <View style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#475569' }}>{lead.status}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
});
