import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { authClient } from '../../../../lib/auth-client';

export default function MobileEmployeeAnalytics({ employeeId }: { employeeId: string }) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
        const res = await authClient.$fetch<any>(`/api/dashboard/sales-manager/employees/${employeeId}/analytics`, { baseURL: baseUrl });
        if (res.data) setAnalytics(res.data);
      } catch (e) {
        console.error('Failed to load analytics', e);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [employeeId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color="#4f46e5" />
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.emptyCard}>
        <Feather name="bar-chart-2" size={32} color="#cbd5e1" style={{ marginBottom: 12 }} />
        <Text style={styles.emptyText}>Analytics data not available.</Text>
      </View>
    );
  }

  const { financial, funnel } = analytics;

  return (
    <ScrollView style={styles.container}>

      {/* Financial Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Performance</Text>
        <View style={styles.card}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Revenue</Text>
              <Text style={styles.statValue}>₹{financial?.revenue || 0}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Sales</Text>
              <Text style={styles.statValue}>{financial?.totalSales || 0}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Funnel Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conversion Funnel</Text>
        <View style={styles.card}>
          <View style={styles.funnelItem}>
            <View style={styles.funnelIconCont}>
              <Feather name="users" size={16} color="#4f46e5" />
            </View>
            <View style={styles.funnelTextCont}>
              <Text style={styles.funnelLabel}>Leads</Text>
            </View>
            <Text style={styles.funnelValue}>{funnel?.leads || 0}</Text>
          </View>

          <View style={styles.funnelItem}>
            <View style={[styles.funnelIconCont, { backgroundColor: '#fef3c7' }]}>
              <Feather name="map-pin" size={16} color="#d97706" />
            </View>
            <View style={styles.funnelTextCont}>
              <Text style={styles.funnelLabel}>Site Visits</Text>
            </View>
            <Text style={styles.funnelValue}>{funnel?.siteVisits || 0}</Text>
          </View>

          <View style={styles.funnelItem}>
            <View style={[styles.funnelIconCont, { backgroundColor: '#dcfce7' }]}>
              <Feather name="dollar-sign" size={16} color="#15803d" />
            </View>
            <View style={styles.funnelTextCont}>
              <Text style={styles.funnelLabel}>Sold</Text>
            </View>
            <Text style={styles.funnelValue}>{funnel?.sold || 0}</Text>
          </View>

          <View style={[styles.funnelItem, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <View style={[styles.funnelIconCont, { backgroundColor: '#f3e8ff' }]}>
              <Feather name="percent" size={16} color="#7e22ce" />
            </View>
            <View style={styles.funnelTextCont}>
              <Text style={styles.funnelLabel}>Conversion Rate</Text>
            </View>
            <Text style={styles.funnelValue}>{funnel?.conversionRate || '0.0'}%</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  funnelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  funnelIconCont: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  funnelTextCont: {
    flex: 1,
  },
  funnelLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  funnelValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
});
