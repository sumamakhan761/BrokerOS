import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

interface Task {
  id: string;
  leadId?: string;
  type: string;
  title: string;
  subtitle: string;
  time?: string;
  status?: string;
  agentName?: string;
}

interface SalesManagerTasksProps {
  dashData: any;
}

export default function SalesManagerTasks({ dashData }: SalesManagerTasksProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'today' | 'backlog'>('today');

  const todayTasks: Task[] = [];
  const backlogTasks: Task[] = [];

  // Map today's SVs
  dashData?.todaySiteVisitList?.forEach((sv: any) => {
    todayTasks.push({
      id: sv.id,
      leadId: sv.lead?.id,
      type: 'sv',
      title: 'Site Visit: ' + (sv.project?.name || 'Project'),
      subtitle: `${sv.lead?.firstName || 'Lead'} - ${sv.lead?.phone || 'No Phone'}`,
      time: new Date(sv.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: sv.status,
      agentName: sv.salesExec?.name || sv.salesExec?.username || 'Unassigned',
    });
  });

  // Map today's Follow-ups
  dashData?.todayFollowUpList?.forEach((fu: any) => {
    todayTasks.push({
      id: fu.id,
      leadId: fu.lead?.id,
      type: 'fu',
      title: 'Follow-up: ' + (fu.lead?.firstName || 'Lead'),
      subtitle: 'Temperature: ' + (fu.lead?.temperature || 'N/A'),
      time: new Date(fu.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: fu.status,
      agentName: fu.user?.name || fu.user?.username || 'Unassigned',
    });
  });

  // Map Backlog SVs
  dashData?.backlogSiteVisitList?.forEach((sv: any) => {
    backlogTasks.push({
      id: sv.id,
      leadId: sv.lead?.id,
      type: 'sv',
      title: 'Pending SV: ' + (sv.project?.name || 'Project'),
      subtitle: `${sv.lead?.firstName || 'Lead'} - ${new Date(sv.scheduledDate).toLocaleDateString()}`,
      status: sv.status,
      agentName: sv.salesExec?.name || sv.salesExec?.username || 'Unassigned',
    });
  });

  // Map Backlog Follow-ups
  dashData?.missedFollowUpBacklog?.forEach((fu: any) => {
    backlogTasks.push({
      id: fu.id,
      leadId: fu.lead?.id,
      type: 'fu',
      title: 'Missed Follow-up: ' + (fu.lead?.firstName || 'Lead'),
      subtitle: `Scheduled: ${new Date(fu.scheduledDate).toLocaleDateString()}`,
      status: fu.status,
      agentName: fu.user?.name || fu.user?.username || 'Unassigned',
    });
  });

  const displayTasks = activeTab === 'today' ? todayTasks : backlogTasks;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Team Schedule</Text>
        <TouchableOpacity onPress={() => router.push('/(dashboard)/sales-manager/lead-management' as any)}>
          <Text style={styles.link}>View Leads</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'today' && styles.activeTab]}
          onPress={() => setActiveTab('today')}
        >
          <Text style={[styles.tabText, activeTab === 'today' && styles.activeTabText]}>Today ({todayTasks.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'backlog' && styles.activeTab]}
          onPress={() => setActiveTab('backlog')}
        >
          <Text style={[styles.tabText, activeTab === 'backlog' && styles.activeTabText]}>Backlog ({backlogTasks.length})</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.taskList}>
        {displayTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="check-circle" size={32} color="#cbd5e1" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyText}>All caught up!</Text>
          </View>
        ) : (
          displayTasks.map((t, i) => (
            <TouchableOpacity
              key={t.id + i}
              style={styles.taskItem}
              onPress={() => {
                if (t.leadId) {
                  router.push({
                    pathname: '/(dashboard)/sales-manager/lead-management/[id]',
                    params: { id: t.leadId }
                  } as any);
                }
              }}
            >
              <View style={[styles.iconBox, t.type === 'sv' ? styles.iconSv : styles.iconFu]}>
                <Feather name={t.type === 'sv' ? 'map-pin' : 'phone-call'} size={16} color={t.type === 'sv' ? '#2563eb' : '#059669'} />
              </View>
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{t.title}</Text>
                <Text style={styles.taskSubtitle}>{t.subtitle}</Text>
                <Text style={styles.taskAgent}>Agent: {t.agentName}</Text>
              </View>
              <View style={styles.taskMeta}>
                {t.time && <Text style={styles.taskTime}>{t.time}</Text>}
                <Text style={styles.taskStatus}>{t.status?.replace(/_/g, ' ')}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  link: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabText: {
    color: '#0f172a',
    fontWeight: '600',
  },
  taskList: {
    gap: 12,
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconSv: {
    backgroundColor: '#dbeafe',
  },
  iconFu: {
    backgroundColor: '#d1fae5',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  taskSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  taskAgent: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
    fontWeight: '500',
  },
  taskMeta: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  taskTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  taskStatus: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'capitalize',
  },
});
