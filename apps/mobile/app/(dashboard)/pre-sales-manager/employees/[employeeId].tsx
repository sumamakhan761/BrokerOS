import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  RefreshControl, StyleSheet, TextInput, Modal, DimensionValue
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { authClient } from '../../../../lib/auth-client';
import { EmployeeAnalyticsView } from '../../../../components/analytics/EmployeeAnalyticsView';

// ── Types ──────────────────────────────────────────────────────────────────

interface DashboardData {
  widgets: {
    newLeads: number;
    hotLeads: number;
    warmLeads: number;
    coldLeads: number;
    todayFollowUps: number;
    missedFollowUps: number;
    siteVisitsScheduled: number;
    bookingsGenerated: number;
  };
  pipeline: Record<string, number>;
  dailyTasks: {
    coldCall: { target: number; done: number; backlog: number; taskId?: string; taskUserId?: string; };
    followUp: { target: number; done: number; backlog: number; };
  };
  backlogs: {
    coldCallBacklogCount: number;
    missedFollowUps: Array<{ id: string; scheduledDate: string; lead: any }>;
  };
}

const PIPELINE_STAGES = [
  { key: 'NEW', label: 'New Lead', color: '#6366f1' },
  { key: 'CONTACTED', label: 'Contacted', color: '#8b5cf6' },
  { key: 'INTERESTED', label: 'Interested', color: '#a78bfa' },
  { key: 'QUALIFIED', label: 'Qualified', color: '#7c3aed' },
  { key: 'SITE_VISIT_SCHEDULED', label: 'Visit Sched.', color: '#4f46e5' },
  { key: 'SITE_VISIT_COMPLETED', label: 'Visit Done', color: '#4338ca' },
  { key: 'BOOKING', label: 'Booking', color: '#3730a3' },
  { key: 'LOST', label: 'Lost', color: '#9ca3af' },
];

function pct(done: number, target: number) {
  if (!target) return 0;
  return Math.min(1, done / target);
}

// ── Component ─────────────────────────────────────────────────────────────

export default function EmployeeDashboardViewScreen() {
  const { employeeId: _employeeId } = useLocalSearchParams();
  const employeeId = (Array.isArray(_employeeId) ? _employeeId[0] : _employeeId) as string;
  const router = useRouter();
  const baseURL = process.env.EXPO_PUBLIC_API_URL as string;

  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Edit Task State
  const [showEditTask, setShowEditTask] = useState(false);
  const [editTarget, setEditTarget] = useState('');
  const [editBacklog, setEditBacklog] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await authClient.$fetch<DashboardData>(`/api/dashboard/pre-sales-manager/employees/${employeeId}/dashboard`, { baseURL });
      if (res.data) setDashData(res.data);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'Failed to load employee dashboard' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [baseURL, employeeId]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  const handleSaveTask = async () => {
    const taskId = dashData?.dailyTasks.coldCall.taskId;
    if (!taskId) { Toast.show({ type: 'error', text1: 'Error', text2: 'Employee has no active task assigned.' }); return; }
    setIsSaving(true);
    try {
      await authClient.$fetch(`/api/dashboard/pre-sales-manager/employees/tasks/${taskId}`, {
        baseURL,
        method: "PATCH",
        body: {
          coldCallTarget: editTarget ? Number(editTarget) : undefined,
          userId: dashData?.dailyTasks.coldCall.taskUserId ? employeeId : undefined,
          backlogOverride: editBacklog ? Number(editBacklog) : undefined,
        },
      });
      setShowEditTask(false);
      load();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e?.message || 'Failed to update task.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const hasBacklog = (dashData?.dailyTasks.coldCall.backlog ?? 0) > 0 || (dashData?.dailyTasks.followUp.backlog ?? 0) > 0;
  const maxPipeline = dashData ? Math.max(1, ...Object.values(dashData.pipeline)) : 1;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>

      {/* Header */}
      <View style={{ padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
        <TouchableOpacity onPress={() => router.navigate('/(dashboard)/pre-sales-manager/employees')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Feather name="arrow-left" size={16} color="#64748b" />
          <Text style={{ color: '#64748b', fontWeight: 'bold', marginLeft: 4 }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0f172a' }}>Viewing Employee</Text>
        <Text style={{ color: '#64748b', fontSize: 13 }}>Full access mode</Text>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
        {['dashboard', 'leads', 'analytics'].map(t => (
          <TouchableOpacity
            key={t}
            style={{ flex: 1, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: activeTab === t ? '#6366f1' : 'transparent' }}
            onPress={() => setActiveTab(t)}
          >
            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: activeTab === t ? '#6366f1' : '#64748b', textTransform: 'capitalize' }}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'leads' ? (
        <EmployeeLeadsView employeeId={employeeId} />
      ) : activeTab === 'analytics' ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <EmployeeAnalyticsView employeeId={employeeId} />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {dashData && (
            <>
              {/* Widgets Grid */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                {[
                  { label: "New Leads", value: dashData.widgets.newLeads, icon: "✦", accent: "#6366f1" },
                  { label: "Follow-ups", value: dashData.widgets.todayFollowUps, icon: "📋", accent: "#10b981" },
                  { label: "Missed", value: dashData.widgets.missedFollowUps, icon: "⚠️", accent: "#f59e0b" },
                  { label: "Site Visits", value: dashData.widgets.siteVisitsScheduled, icon: "📍", accent: "#8b5cf6" },
                ].map((w, i) => (
                  <View key={i} style={[styles.card, { width: '48%', padding: 16 }]}>
                    <Text style={{ fontSize: 24, marginBottom: 8 }}>{w.icon}</Text>
                    <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a' }}>{w.value}</Text>
                    <Text style={{ fontSize: 13, color: '#64748b' }}>{w.label}</Text>
                  </View>
                ))}
              </View>

              {/* Tasks */}
              <View style={[styles.card, { padding: 20, marginBottom: 20, backgroundColor: hasBacklog ? '#fffbeb' : '#fff', borderColor: hasBacklog ? '#fcd34d' : '#f1f5f9', borderWidth: 1 }]}>
                {hasBacklog && <Text style={{ color: '#d97706', fontWeight: 'bold', marginBottom: 12 }}>⚠️ Has Backlogs</Text>}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a' }}>Daily Tasks</Text>
                  <TouchableOpacity onPress={() => {
                    setEditTarget(String(dashData.dailyTasks.coldCall.target));
                    setEditBacklog(String(dashData.dailyTasks.coldCall.backlog));
                    setShowEditTask(true);
                  }}>
                    <Text style={{ color: '#6366f1', fontWeight: 'bold', fontSize: 13 }}>Edit Task</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1, backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                    <Text style={{ color: '#64748b', fontSize: 12, fontWeight: 'bold' }}>COLD CALLS</Text>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#6366f1', marginVertical: 4 }}>
                      {dashData.dailyTasks.coldCall.done} <Text style={{ fontSize: 14, color: '#94a3b8' }}>/ {dashData.dailyTasks.coldCall.target}</Text>
                    </Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                    <Text style={{ color: '#64748b', fontSize: 12, fontWeight: 'bold' }}>FOLLOW-UPS</Text>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981', marginVertical: 4 }}>
                      {dashData.dailyTasks.followUp.done} <Text style={{ fontSize: 14, color: '#94a3b8' }}>/ {dashData.dailyTasks.followUp.target}</Text>
                    </Text>
                  </View>
                </View>
              </View>

              {/* Pipeline */}
              <View style={[styles.card, { padding: 20, marginBottom: 20 }]}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#0f172a' }}>Pipeline Status</Text>
                {PIPELINE_STAGES.map((stage) => {
                  const count = dashData.pipeline[stage.key] || 0;
                  const w = `${(count / maxPipeline) * 100}%` as DimensionValue;
                  return (
                    <View key={stage.key} style={{ marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 13, color: '#64748b' }}>{stage.label}</Text>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#0f172a' }}>{count}</Text>
                      </View>
                      <View style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 3 }}>
                        <View style={{ height: '100%', width: w, backgroundColor: stage.color, borderRadius: 3 }} />
                      </View>
                    </View>
                  );
                })}
              </View>

            </>
          )}
        </ScrollView>
      )}

      {/* Edit Task Modal */}
      {showEditTask && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Edit Employee Task</Text>

            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#374151', marginBottom: 6 }}>Cold Call Target (Today Only)</Text>
            <TextInput
              style={styles.input}
              value={editTarget}
              onChangeText={setEditTarget}
              keyboardType="number-pad"
            />

            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#374151', marginTop: 8, marginBottom: 2 }}>Backlog Override (Optional)</Text>
            <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>Use this to clear/reduce an employee's backlog.</Text>
            <TextInput
              style={styles.input}
              value={editBacklog}
              onChangeText={setEditBacklog}
              keyboardType="number-pad"
              placeholder="e.g. 0 to clear"
            />

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity style={{ flex: 1, padding: 12, backgroundColor: '#f1f5f9', borderRadius: 8 }} onPress={() => setShowEditTask(false)}>
                <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#475569' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, padding: 12, backgroundColor: '#6366f1', borderRadius: 8, opacity: isSaving ? 0.6 : 1 }} onPress={handleSaveTask} disabled={isSaving}>
                <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>{isSaving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function EmployeeLeadsView({ employeeId }: { employeeId: string }) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeads() {
      try {
        const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
        const res = await authClient.$fetch<any[]>(`/api/leads/employee/${employeeId}`, { baseURL: baseUrl });
        if (res.data) setLeads(res.data);
      } catch (e) {
        console.error("Failed to load leads", e);
      } finally {
        setLoading(false);
      }
    }
    loadLeads();
  }, [employeeId]);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <ActivityIndicator size="small" color="#6366f1" />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {leads.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: '#94a3b8' }}>No leads found.</Text>
        </View>
      ) : (
        leads.map(lead => (
          <View key={lead.id} style={[styles.card, { padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <View>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#0f172a', marginBottom: 4 }}>{lead.firstName} {lead.lastName}</Text>
              <Text style={{ color: '#64748b', fontSize: 12 }}>Score: {lead.score || 0}</Text>
              <Text style={{ color: '#64748b', fontSize: 12 }}>Follow-up: {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString() : 'None'}</Text>
            </View>
            <View style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#475569' }}>{lead.status}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  modalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20, zIndex: 100 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, marginBottom: 4 },
});
