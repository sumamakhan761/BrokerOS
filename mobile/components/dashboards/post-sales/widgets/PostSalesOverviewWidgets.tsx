import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PostSalesDashboardData } from '../misc/types';

interface OverviewWidgetsProps {
  widgets: PostSalesDashboardData['widgets'];
}

export default function PostSalesOverviewWidgets({ widgets }: OverviewWidgetsProps) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {[
          { label: 'Total Booked', value: widgets.totalBooked, icon: 'users', accent: '#6366f1' },
          { label: 'Documents Pending', value: widgets.documentsPending, icon: 'file-text', accent: '#f59e0b' },
          { label: 'Loan Cases', value: widgets.loanCases, icon: 'dollar-sign', accent: '#3b82f6' },
          { label: 'Agreement Pending', value: widgets.agreementPending, icon: 'edit-3', accent: '#8b5cf6' },
          { label: 'Possession Pending', value: widgets.possessionPending, icon: 'key', accent: '#ec4899' },
          { label: 'Handover Completed', value: widgets.handoverCompleted, icon: 'check-circle', accent: '#10b981' },
        ].map((w) => (
          <View key={w.label} style={[styles.widgetCard, { width: '47.5%', borderColor: '#e2e8f0' }]}>
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: w.accent + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
              <Feather name={w.icon as any} size={16} color={w.accent} />
            </View>
            <Text style={{ fontSize: 26, fontWeight: '800', color: '#0f172a' }}>{w.value}</Text>
            <Text style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{w.label}</Text>
            <View style={{ height: 2, backgroundColor: w.accent, borderRadius: 1, marginTop: 10, opacity: 0.6 }} />
          </View>
        ))}
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
  widgetCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
