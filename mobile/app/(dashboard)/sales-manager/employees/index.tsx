import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { authClient } from '../../../../lib/auth-client';
import { useRouter } from 'expo-router';

// Types
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

interface Announcement {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export default function EmployeesScreen() {
  const router = useRouter();
  const [employees, setEmployees] = useState<SalesEmployee[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Announcement Modal State
  const [annModalVisible, setAnnModalVisible] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annDesc, setAnnDesc] = useState('');
  const [isSavingAnn, setIsSavingAnn] = useState(false);

  const loadData = async () => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
      const [empRes, annRes] = await Promise.all([
        authClient.$fetch<SalesEmployee[]>("/api/dashboard/sales-manager/employees", { baseURL: baseUrl }),
        authClient.$fetch<Announcement[]>("/api/dashboard/sales-manager/employees/announcements", { baseURL: baseUrl }),
      ]);
      if (empRes.data) setEmployees(empRes.data);
      if (annRes.data) setAnnouncements(annRes.data);
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
    // Poll every 15s so on-call status updates automatically
    const interval = setInterval(() => { loadData(); }, 15000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleOpenAnnModal = (ann?: Announcement) => {
    if (ann) {
      setEditingAnn(ann);
      setAnnTitle(ann.title);
      setAnnDesc(ann.description);
    } else {
      setEditingAnn(null);
      setAnnTitle('');
      setAnnDesc('');
    }
    setAnnModalVisible(true);
  };

  const handleSaveAnn = async () => {
    if (!annTitle.trim() || !annDesc.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSavingAnn(true);
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
    try {
      if (editingAnn) {
        await authClient.$fetch(`/api/dashboard/sales-manager/employees/announcements/${editingAnn.id}`, {
          method: 'PATCH',
          baseURL: baseUrl,
          body: { title: annTitle, description: annDesc }
        });
      } else {
        await authClient.$fetch('/api/dashboard/sales-manager/employees/announcements', {
          method: 'POST',
          baseURL: baseUrl,
          body: { title: annTitle, description: annDesc }
        });
      }
      setAnnModalVisible(false);
      await loadData();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save announcement');
    } finally {
      setIsSavingAnn(false);
    }
  };

  const handleDeleteAnn = (id: string) => {
    Alert.alert('Delete Announcement', 'Are you sure you want to delete this announcement?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
            await authClient.$fetch(`/api/dashboard/sales-manager/employees/announcements/${id}`, {
              method: 'DELETE',
              baseURL: baseUrl
            });
            await loadData();
          } catch (e: any) {
            Alert.alert('Error', 'Failed to delete announcement');
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View style={styles.headerIconContainer}>
          <Feather name="users" size={24} color="#4f46e5" />
        </View>
        <View>
          <Text style={styles.headerTitle}>Employees</Text>
          <Text style={styles.headerSubtitle}>Team directory & performance</Text>
        </View>
      </View>

      {/* Announcements Section */}
      <View style={[styles.sectionHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <Text style={styles.sectionTitle}>📢 Announcements</Text>
        <TouchableOpacity style={styles.newAnnBtn} onPress={() => handleOpenAnnModal()}>
          <Text style={styles.newAnnBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {announcements.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No announcements active.</Text>
        </View>
      ) : (
        announcements.map((ann) => (
          <View key={ann.id} style={[styles.card, { backgroundColor: '#fdf4ff' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.cardTitle, { color: '#86198f' }]}>{ann.title}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 12, paddingTop: 2 }}>
                <TouchableOpacity onPress={() => handleOpenAnnModal(ann)}>
                  <Feather name="edit-2" size={16} color="#86198f" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteAnn(ann.id)}>
                  <Feather name="trash-2" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.cardDesc}>{ann.description}</Text>
          </View>
        ))
      )}

      {/* Employees Grid */}
      <View style={[styles.sectionHeader, { marginTop: 20 }]}>
        <Text style={styles.sectionTitle}>👥 Team Members</Text>
      </View>

      {employees.length === 0 ? (
        <View style={styles.emptyCard}>
          <Feather name="users" size={32} color="#cbd5e1" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyText}>No employees found</Text>
        </View>
      ) : (
        employees.map((emp) => (
          <View key={emp.id} style={styles.card}>
            <View style={styles.empHeader}>
              <View style={{ position: 'relative' }}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{(emp.name || emp.username).substring(0, 2).toUpperCase()}</Text>
                </View>
                {/* On-call dot on avatar */}
                <View style={[
                  styles.statusDot,
                  { backgroundColor: emp.isOnCall ? '#22c55e' : '#eab308' }
                ]} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.empName}>{emp.name || emp.username}</Text>
                {emp.employeeCode && <Text style={styles.empCode}>{emp.employeeCode}</Text>}
                {/* On-call status pill */}
                <View style={[styles.statusPill, { backgroundColor: emp.isOnCall ? '#dcfce7' : '#fef9c3' }]}>
                  <View style={[styles.statusPillDot, { backgroundColor: emp.isOnCall ? '#16a34a' : '#ca8a04' }]} />
                  <Text style={[styles.statusPillText, { color: emp.isOnCall ? '#15803d' : '#a16207' }]}>
                    {emp.isOnCall ? 'On Call' : 'Not in Call'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.dashBtn}
                onPress={() => router.push(`/(dashboard)/sales-manager/employees/${emp.id}` as any)}
              >
                <Text style={styles.dashBtnText}>Dashboard</Text>
                <Feather name="arrow-right" size={14} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{emp.stats.siteVisitsScheduled}</Text>
                <Text style={styles.statLabel}>SV Sched</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: '#10b981' }]}>{emp.stats.siteVisitsCompleted}</Text>
                <Text style={styles.statLabel}>SV Comp</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: '#3b82f6' }]}>{emp.stats.bookings}</Text>
                <Text style={styles.statLabel}>Bookings</Text>
              </View>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 40 }} />

      {/* Announcement Modal */}
      <Modal visible={annModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingAnn ? 'Edit Announcement' : 'New Announcement'}</Text>
              <TouchableOpacity onPress={() => setAnnModalVisible(false)}>
                <Feather name="x" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.textInput}
              value={annTitle}
              onChangeText={setAnnTitle}
              placeholder="Announcement Title"
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
              value={annDesc}
              onChangeText={setAnnDesc}
              placeholder="Message to the team..."
              placeholderTextColor="#94a3b8"
              multiline
            />
            <TouchableOpacity
              style={[styles.saveBtn, isSavingAnn && { opacity: 0.7 }]}
              onPress={handleSaveAnn}
              disabled={isSavingAnn}
            >
              {isSavingAnn ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save Announcement</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#e0e7ff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  empHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  empName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  empCode: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  dashBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dashBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
  },
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
    marginTop: 4,
    alignSelf: 'flex-start',
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
  newAnnBtn: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newAnnBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: '#4f46e5',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
