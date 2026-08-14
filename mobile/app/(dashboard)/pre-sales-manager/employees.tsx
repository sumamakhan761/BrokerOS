import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { authClient } from '../../../lib/auth-client';
import { AnnouncementsSection } from '../../../components/dashboards/pre-sales-manager/sections/AnnouncementsSection';
import { TasksSection } from '../../../components/dashboards/pre-sales-manager/sections/TasksSection';
import { TeamMembersList } from '../../../components/dashboards/pre-sales-manager/lists/TeamMembersList';
import { TaskModal } from '../../../components/dashboards/pre-sales-manager/modals/TaskModal';
import { AnnouncementModal } from '../../../components/dashboards/pre-sales-manager/modals/AnnouncementModal';

// ── Types ──────────────────────────────────────────────────────────────────

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

interface ManagerTask {
  id: string;
  coldCallTarget: number;
  isActive: boolean;
  createdAt: string;
  assignees: Array<{ userId: string; user: { id: string; name?: string; username?: string }; backlogOverride?: number }>;
}

interface Announcement {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function PreSalesManagerEmployeesScreen() {
  const router = useRouter();
  const baseURL = process.env.EXPO_PUBLIC_API_URL as string;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<ManagerTask[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [taskModal, setTaskModal] = useState<{ show: boolean; mode: 'create' | 'edit'; id?: string; target: string }>({ show: false, mode: 'create', target: '100' });
  const [annModal, setAnnModal] = useState<{ show: boolean; mode: 'create' | 'edit'; id?: string; title: string; desc: string }>({ show: false, mode: 'create', title: '', desc: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [empRes, taskRes, annRes] = await Promise.all([
        authClient.$fetch<Employee[]>('/api/dashboard/pre-sales-manager/employees', { baseURL }),
        authClient.$fetch<ManagerTask[]>('/api/dashboard/pre-sales-manager/employees/tasks', { baseURL }),
        authClient.$fetch<Announcement[]>('/api/dashboard/pre-sales-manager/employees/announcements', { baseURL }),
      ]);
      if (empRes.data) setEmployees(empRes.data);
      if (taskRes.data) setTasks(taskRes.data);
      if (annRes.data) setAnnouncements(annRes.data);
    } catch (e) {
      console.error('Employees load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [baseURL]);

  useEffect(() => { load(); }, [load]);
  // Poll every 15s so the on-call status refreshes automatically
  useEffect(() => {
    const interval = setInterval(() => { load(); }, 15000);
    return () => clearInterval(interval);
  }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  // Task Actions
  const handleSaveTask = async () => {
    if (!taskModal.target) return;
    setSaving(true);
    try {
      if (taskModal.mode === 'create') {
        await authClient.$fetch('/api/dashboard/pre-sales-manager/employees/tasks', {
          baseURL, method: 'POST', body: { coldCallTarget: Number(taskModal.target), assignToAll: true },
        });
      } else {
        await authClient.$fetch(`/api/dashboard/pre-sales-manager/employees/tasks/${taskModal.id}`, {
          baseURL, method: 'PATCH', body: { coldCallTarget: Number(taskModal.target) },
        });
      }
      setTaskModal({ show: false, mode: 'create', target: '100' });
      load();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = (id: string) => {
    Alert.alert('Confirm Delete', 'Delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await authClient.$fetch(`/api/dashboard/pre-sales-manager/employees/tasks/${id}`, { baseURL, method: 'DELETE' });
          load();
        }
      }
    ]);
  };

  // Ann Actions
  const handleSaveAnn = async () => {
    if (!annModal.title || !annModal.desc) return;
    setSaving(true);
    try {
      if (annModal.mode === 'create') {
        await authClient.$fetch('/api/dashboard/pre-sales-manager/employees/announcements', {
          baseURL, method: 'POST', body: { title: annModal.title, description: annModal.desc },
        });
      } else {
        await authClient.$fetch(`/api/dashboard/pre-sales-manager/employees/announcements/${annModal.id}`, {
          baseURL, method: 'PATCH', body: { title: annModal.title, description: annModal.desc },
        });
      }
      setAnnModal({ show: false, mode: 'create', title: '', desc: '' });
      load();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAnn = (id: string) => {
    Alert.alert('Confirm Delete', 'Delete this announcement? It will disappear immediately.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await authClient.$fetch(`/api/dashboard/pre-sales-manager/employees/announcements/${id}`, { baseURL, method: 'DELETE' });
          load();
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 }}>Employees</Text>
        <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>This month's activity across your team</Text>

        <AnnouncementsSection
          announcements={announcements}
          onNew={() => setAnnModal({ show: true, mode: 'create', title: '', desc: '' })}
          onEdit={(id, title, desc) => setAnnModal({ show: true, mode: 'edit', id, title, desc })}
          onDelete={handleDeleteAnn}
        />

        <TasksSection
          tasks={tasks}
          onCreate={() => setTaskModal({ show: true, mode: 'create', target: '100' })}
          onEdit={(id, target) => setTaskModal({ show: true, mode: 'edit', id, target })}
          onDelete={handleDeleteTask}
        />

        <TeamMembersList employees={employees} />

      </ScrollView>

      <TaskModal
        show={taskModal.show}
        mode={taskModal.mode}
        target={taskModal.target}
        saving={saving}
        onTargetChange={(v) => setTaskModal(p => ({ ...p, target: v }))}
        onCancel={() => setTaskModal({ show: false, mode: 'create', target: '100' })}
        onSave={handleSaveTask}
      />

      <AnnouncementModal
        show={annModal.show}
        mode={annModal.mode}
        title={annModal.title}
        desc={annModal.desc}
        saving={saving}
        onTitleChange={(v) => setAnnModal(p => ({ ...p, title: v }))}
        onDescChange={(v) => setAnnModal(p => ({ ...p, desc: v }))}
        onCancel={() => setAnnModal({ show: false, mode: 'create', title: '', desc: '' })}
        onSave={handleSaveAnn}
      />
    </View>
  );
}
