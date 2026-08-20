import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PostSalesDashboardData } from '../misc/types';
import { STATUS_LABEL } from '../../pre-sales/misc/constants';

interface PostSalesFollowUpsProps {
  todayFollowUpList: PostSalesDashboardData['todayFollowUpList'];
  confirmFollowUp: (followUpId: string) => void;
  baseRoute?: string;
}

export default function PostSalesFollowUps({ todayFollowUpList, confirmFollowUp, baseRoute = "/(dashboard)/post-sales" }: PostSalesFollowUpsProps) {
  const router = useRouter();

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 4 }}>
        <Text style={[styles.sectionTitle, { marginBottom: 0, marginTop: 0 }]}>Today's Follow-ups</Text>
        <View style={{ backgroundColor: '#d1fae5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
          <Text style={{ color: '#047857', fontSize: 10, fontWeight: '700' }}>TODAY</Text>
        </View>
      </View>
      <View style={styles.card}>
        {todayFollowUpList.length === 0 ? (
          <Text style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', paddingVertical: 20 }}>No follow-ups today.</Text>
        ) : (
          <View style={{ gap: 10 }}>
            {todayFollowUpList.map((fu, i) => {
              return (
                <TouchableOpacity key={fu.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: i < todayFollowUpList.length - 1 ? 1 : 0, borderBottomColor: '#f1f5f9', paddingBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#64748b' }}>{fu.lead?.firstName?.charAt(0) || '?'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>{fu.lead ? `${fu.lead.firstName} ${fu.lead.lastName || ''}`.trim() : 'Unknown'}</Text>
                      <Text style={{ fontSize: 12, color: '#64748b' }}>{STATUS_LABEL[fu.lead?.status || ''] || fu.lead?.status || '—'}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    {(fu.status === 'SCHEDULED' || fu.status === 'RESCHEDULED' || fu.status === 'MISSED') ? (
                      <TouchableOpacity onPress={() => confirmFollowUp(fu.id)} style={{ backgroundColor: '#d1fae5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#a7f3d0' }}>
                        <Text style={{ color: '#047857', fontSize: 11, fontWeight: '700' }}>✓ Confirm</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#10b981', paddingHorizontal: 10, paddingVertical: 6 }}>Done ✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <TouchableOpacity onPress={() => router.push({ pathname: `${baseRoute}/lead-management` as any, params: { followUpDate: new Date().toLocaleDateString('en-CA') } })} style={{ marginTop: 16, backgroundColor: '#eef2ff', padding: 12, borderRadius: 12 }}>
          <Text style={{ textAlign: 'center', fontSize: 13, fontWeight: '700', color: '#4f46e5' }}>See all follow-ups </Text>
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
