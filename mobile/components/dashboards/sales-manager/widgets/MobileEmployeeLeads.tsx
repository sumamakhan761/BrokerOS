import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color="#4f46e5" />
      </View>
    );
  }

  if (leads.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Feather name="inbox" size={32} color="#cbd5e1" style={{ marginBottom: 12 }} />
        <Text style={styles.emptyText}>No leads assigned to this employee.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {leads.map((lead) => (
        <View key={lead.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.leadName}>{lead.firstName} {lead.lastName}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{lead.status}</Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.infoRow}>
              <Feather name="star" size={14} color="#64748b" />
              <Text style={styles.infoText}>Score: {lead.score || 0}/100</Text>
            </View>
            <View style={styles.infoRow}>
              <Feather name="calendar" size={14} color="#64748b" />
              <Text style={styles.infoText}>
                Next Follow-up: {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString() : 'None'}
              </Text>
            </View>
          </View>
        </View>
      ))}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginTop: 16,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leadName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statusBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  cardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#64748b',
  },
});
