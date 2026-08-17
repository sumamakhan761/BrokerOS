import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet, ActivityIndicator } from 'react-native';

interface AnnouncementModalProps {
  show: boolean;
  mode: 'create' | 'edit';
  title: string;
  desc: string;
  saving: boolean;
  onTitleChange: (v: string) => void;
  onDescChange: (v: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function AnnouncementModal({ show, mode, title, desc, saving, onTitleChange, onDescChange, onCancel, onSave }: AnnouncementModalProps) {
  return (
    <Modal visible={show} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>{mode === 'create' ? 'New Announcement' : 'Edit Announcement'}</Text>
          <TextInput style={styles.input} value={title} onChangeText={onTitleChange} placeholder="Title" />
          <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={desc} onChangeText={onDescChange} placeholder="Description" multiline />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <TouchableOpacity style={{ flex: 1, padding: 12, backgroundColor: '#f1f5f9', borderRadius: 8 }} onPress={onCancel}>
              <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#475569' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ flex: 1, padding: 12, backgroundColor: '#4f46e5', borderRadius: 8, opacity: saving ? 0.7 : 1 }} 
              onPress={onSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#f8fafc' },
});
