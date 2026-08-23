import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';

interface Employee {
  id: string;
  name?: string;
  username?: string;
  image?: string;
  employeeCode?: string;
  isOnCall?: boolean;
  stats: {
    totalLeads: number;
    contactedLeads: number;
    followUpsDone: number;
    siteVisits: number;
  };
}

export function TeamMembersList({ employees }: { employees: Employee[] }) {
  const router = useRouter();
  return (
    <>
      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: 12 }}>👥 Team Members</Text>
      <View style={{ flexDirection: 'column', gap: 12 }}>
        {employees.map((emp) => (
          <TouchableOpacity
            key={emp.id}
            style={[styles.card, { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
            onPress={() => router.push(`/pre-sales-manager/employees/${emp.id}` as any)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View>
                <Avatar name={emp.name || emp.username} size={48} />
                {/* On-call indicator dot on avatar */}
                <View style={[
                  styles.statusDot,
                  { backgroundColor: emp.isOnCall ? '#22c55e' : '#eab308' }
                ]} />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#0f172a' }}>{emp.name || emp.username}</Text>
                {/* On-call status label */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 4 }}>
                  <View style={[styles.statusPill, { backgroundColor: emp.isOnCall ? '#dcfce7' : '#fef9c3' }]}>
                    <View style={[styles.statusPillDot, { backgroundColor: emp.isOnCall ? '#16a34a' : '#ca8a04' }]} />
                    <Text style={[styles.statusPillText, { color: emp.isOnCall ? '#15803d' : '#a16207' }]}>
                      {emp.isOnCall ? 'On Call' : 'Not in Call'}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                  <Text style={{ fontSize: 12, color: '#64748b' }}><Text style={{ fontWeight: 'bold', color: '#6366f1' }}>{emp.stats.totalLeads}</Text> Leads</Text>
                  <Text style={{ fontSize: 12, color: '#64748b' }}><Text style={{ fontWeight: 'bold', color: '#8b5cf6' }}>{emp.stats.contactedLeads}</Text> Contacted</Text>
                </View>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  statusDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    gap: 4,
  },
  statusPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

