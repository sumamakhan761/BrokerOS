import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LeadListItem } from '../misc/types';

interface PendingListWidgetProps {
  title: string;
  list: LeadListItem[];
  statusFilter: string;
  emptyMessage?: string;
  baseRoute?: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DOCUMENT: { bg: "#fef3c7", text: "#d97706" },
  LOAN: { bg: "#dbeafe", text: "#2563eb" },
  AGREEMENT: { bg: "#f3e8ff", text: "#9333ea" },
  HANDOVER: { bg: "#fce7f3", text: "#db2777" },
};

export default function PendingListWidget({ title, list, statusFilter, emptyMessage = "No pending items.", baseRoute = "/(dashboard)/post-sales" }: PendingListWidgetProps) {
  const router = useRouter();

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 8 }}>
        <Text style={[styles.sectionTitle, { marginBottom: 0, marginTop: 0 }]}>{title}</Text>
      </View>
      <View style={styles.card}>
        {list.length === 0 ? (
          <Text style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', paddingVertical: 20 }}>{emptyMessage}</Text>
        ) : (
          <View style={{ gap: 10 }}>
            {list.map((lead, i) => {
              const badgeStyle = STATUS_COLORS[lead.status] || { bg: "#f1f5f9", text: "#475569" };
              return (
                <TouchableOpacity
                  key={lead.id}
                  onPress={() => router.push({ pathname: `${baseRoute}/lead-management/[id]` as any, params: { id: lead.id } })}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: i < list.length - 1 ? 1 : 0, borderBottomColor: '#f1f5f9', paddingBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#64748b' }}>{lead.firstName?.charAt(0) || '?'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>{`${lead.firstName} ${lead.lastName || ''}`.trim()}</Text>
                      <Text style={{ fontSize: 12, color: '#64748b' }}>{lead.phone || "No phone number"}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <View style={{ backgroundColor: badgeStyle.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                      <Text style={{ color: badgeStyle.text, fontSize: 10, fontWeight: '700' }}>
                        {lead.subStatus && lead.status === 'HANDOVER' ? lead.subStatus : lead.status}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <TouchableOpacity
          onPress={() => router.push({ pathname: `${baseRoute}/lead-management` as any, params: { status: statusFilter } })} style={{ marginTop: 16, backgroundColor: '#eef2ff', padding: 12, borderRadius: 12 }}>
          <Text style={{ textAlign: 'center', fontSize: 13, fontWeight: '700', color: '#4f46e5' }}>See all {title.toLowerCase()} </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 6,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
