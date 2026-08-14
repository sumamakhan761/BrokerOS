import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ManagerTask {
  id: string;
  coldCallTarget: number;
  isActive: boolean;
  createdAt: string;
  assignees: Array<{ userId: string; user: { id: string; name?: string; username?: string }; backlogOverride?: number }>;
}

interface TasksSectionProps {
  tasks: ManagerTask[];
  onCreate: () => void;
  onEdit: (id: string, target: string) => void;
  onDelete: (id: string) => void;
}

export function TasksSection({ tasks, onCreate, onEdit, onDelete }: TasksSectionProps) {
  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>🎯 Daily Tasks</Text>
        <TouchableOpacity onPress={onCreate}>
          <Text style={{ color: '#6366f1', fontWeight: '600' }}>+ Create Task</Text>
        </TouchableOpacity>
      </View>
      {tasks.length === 0 ? (
        <Text style={{ color: '#94a3b8', fontStyle: 'italic' }}>No active tasks.</Text>
      ) : (
        tasks.map((task) => (
          <View key={task.id} style={[styles.card, { borderColor: '#e0e7ff', borderWidth: 1, borderLeftWidth: 4, borderLeftColor: '#6366f1' }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold', color: '#3730a3', marginBottom: 4 }}>Target: {task.coldCallTarget} calls/day</Text>
              <Text style={{ color: '#818cf8', fontSize: 12 }}>Assigned to: {task.assignees.length} employees</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => onEdit(task.id, String(task.coldCallTarget))}><Feather name="edit-2" size={16} color="#6366f1" /></TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(task.id)}><Feather name="trash-2" size={16} color="#ef4444" /></TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
});
