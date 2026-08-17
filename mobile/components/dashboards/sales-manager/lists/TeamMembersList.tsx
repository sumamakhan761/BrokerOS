import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';

interface SalesEmployee {
  id: string;
  name: string;
  username: string;
  image: string | null;
  employeeCode: string | null;
  isOnCall?: boolean;
  stats: {
    siteVisitsScheduled: number;
    siteVisitsCompleted: number;
    bookings: number;
  };
}

export function TeamMembersList({ employees }: { employees: SalesEmployee[] }) {
  const router = useRouter();
  
  return (
    <View style={{ marginTop: 20 }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>👥 Team Members</Text>
      
      {employees.length === 0 ? (
        <View style={styles.emptyCard}>
          <Feather name="users" size={32} color="#cbd5e1" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyText}>No employees found</Text>
        </View>
      ) : (
        <View style={{ flexDirection: 'column', gap: 12 }}>
          {employees.map((emp) => (
            <TouchableOpacity
              key={emp.id}
              style={[styles.card, { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
              onPress={() => router.push(`/(dashboard)/sales-manager/employees/${emp.id}` as any)}
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#0f172a' }}>{emp.name || emp.username}</Text>
                    {emp.employeeCode && <Text style={{ fontSize: 12, color: '#64748b' }}>({emp.employeeCode})</Text>}
                  </View>
                  
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
                    <Text style={{ fontSize: 12, color: '#64748b' }}><Text style={{ fontWeight: 'bold', color: '#6366f1' }}>{emp.stats.siteVisitsScheduled}</Text> SV Sched</Text>
                    <Text style={{ fontSize: 12, color: '#64748b' }}><Text style={{ fontWeight: 'bold', color: '#10b981' }}>{emp.stats.siteVisitsCompleted}</Text> SV Comp</Text>
                    <Text style={{ fontSize: 12, color: '#64748b' }}><Text style={{ fontWeight: 'bold', color: '#3b82f6' }}>{emp.stats.bookings}</Text> Bookings</Text>
                  </View>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
  statusDot: { position: 'absolute', bottom: 1, right: 1, width: 13, height: 13, borderRadius: 7, borderWidth: 2, borderColor: '#fff' },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, gap: 4 },
  statusPillDot: { width: 6, height: 6, borderRadius: 3 },
  statusPillText: { fontSize: 11, fontWeight: '600' },
  emptyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  emptyText: { color: '#94a3b8', fontSize: 14 },
});
