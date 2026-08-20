import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { authClient } from '../../../../lib/auth-client';
import { AnnouncementsSection } from '../../../../components/dashboards/sales-manager/sections/AnnouncementsSection';
import { TeamMembersList } from '../../../../components/dashboards/post-sales-manager/lists/TeamMembersList';
import { AnnouncementModal } from '../../../../components/dashboards/sales-manager/modals/AnnouncementModal';

// Types
interface PostSalesEmployee {
  id: string;
  name: string;
  username: string;
  image: string | null;
  employeeCode: string | null;
  isOnCall?: boolean;
  stats: {
    totalBookings: number;
    pendingDocs: number;
    loanCases: number;
  };
}

interface Announcement {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState<PostSalesEmployee[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Announcement Modal State
  const [annModal, setAnnModal] = useState<{ show: boolean; mode: 'create' | 'edit'; id?: string; title: string; desc: string }>({ show: false, mode: 'create', title: '', desc: '' });
  const [isSavingAnn, setIsSavingAnn] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
      const [empRes, annRes] = await Promise.all([
        authClient.$fetch<PostSalesEmployee[]>("/api/dashboard/post-sales-manager/employees", { baseURL: baseUrl }),
        authClient.$fetch<Announcement[]>("/api/dashboard/post-sales-manager/employees/announcements", { baseURL: baseUrl }),
      ]);
      if (empRes.data) setEmployees(empRes.data);
      if (annRes.data) setAnnouncements(annRes.data);
    } catch (e: any) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
    // Poll every 15s so on-call status updates automatically
    const interval = setInterval(() => { loadData(); }, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSaveAnn = async () => {
    if (!annModal.title.trim() || !annModal.desc.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill in all fields' });
      return;
    }

    setIsSavingAnn(true);
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
    try {
      if (annModal.mode === 'edit' && annModal.id) {
        await authClient.$fetch(`/api/dashboard/post-sales-manager/employees/announcements/${annModal.id}`, {
          method: 'PATCH',
          baseURL: baseUrl,
          body: { title: annModal.title, description: annModal.desc }
        });
      } else {
        await authClient.$fetch('/api/dashboard/post-sales-manager/employees/announcements', {
          method: 'POST',
          baseURL: baseUrl,
          body: { title: annModal.title, description: annModal.desc }
        });
      }
      setAnnModal({ show: false, mode: 'create', title: '', desc: '' });
      await loadData();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e?.message || 'Failed to save announcement' });
    } finally {
      setIsSavingAnn(false);
    }
  };

  const handleDeleteAnn = async (id: string) => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
      await authClient.$fetch(`/api/dashboard/post-sales-manager/employees/announcements/${id}`, {
        method: 'DELETE',
        baseURL: baseUrl
      });
      await loadData();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete announcement' });
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 }}>Employees</Text>
        <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Team directory & performance</Text>

        <AnnouncementsSection
          announcements={announcements}
          onNew={() => setAnnModal({ show: true, mode: 'create', title: '', desc: '' })}
          onEdit={(id, title, desc) => setAnnModal({ show: true, mode: 'edit', id, title, desc })}
          onDelete={handleDeleteAnn}
        />

        <TeamMembersList employees={employees} />

      </ScrollView>

      <AnnouncementModal
        show={annModal.show}
        mode={annModal.mode}
        title={annModal.title}
        desc={annModal.desc}
        saving={isSavingAnn}
        onTitleChange={(v) => setAnnModal(p => ({ ...p, title: v }))}
        onDescChange={(v) => setAnnModal(p => ({ ...p, desc: v }))}
        onCancel={() => setAnnModal({ show: false, mode: 'create', title: '', desc: '' })}
        onSave={handleSaveAnn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});
