import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Announcement {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

interface AnnouncementsSectionProps {
  announcements: Announcement[];
  onNew: () => void;
  onEdit: (id: string, title: string, desc: string) => void;
  onDelete: (id: string) => void;
}

export function AnnouncementsSection({ announcements, onNew, onEdit, onDelete }: AnnouncementsSectionProps) {
  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>📢 Announcements</Text>
        <TouchableOpacity onPress={onNew}>
          <Text style={{ color: '#4f46e5', fontWeight: '600' }}>+ New</Text>
        </TouchableOpacity>
      </View>
      {announcements.length === 0 ? (
        <Text style={{ color: '#94a3b8', fontStyle: 'italic' }}>No announcements active.</Text>
      ) : (
        announcements.map((ann) => (
          <View key={ann.id} style={[styles.card, { backgroundColor: '#fffbeb', borderColor: '#fcd34d', borderWidth: 1 }]}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ fontWeight: 'bold', color: '#92400e', marginBottom: 4 }}>{ann.title}</Text>
              <Text style={{ color: '#b45309', fontSize: 13 }}>{ann.description}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => onEdit(ann.id, ann.title, ann.description)}><Feather name="edit-2" size={16} color="#4f46e5" /></TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(ann.id)}><Feather name="trash-2" size={16} color="#ef4444" /></TouchableOpacity>
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
