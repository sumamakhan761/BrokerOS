import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet } from 'react-native';

interface TaskModalProps {
  show: boolean;
  mode: 'create' | 'edit';
  target: string;
  saving: boolean;
  onTargetChange: (v: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function TaskModal({ show, mode, target, saving, onTargetChange, onCancel, onSave }: TaskModalProps) {
  return (
    <Modal visible={show} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>{mode === 'create' ? 'Create Task' : 'Edit Target'}</Text>
          <TextInput
            style={styles.input}
            value={target}
            onChangeText={onTargetChange}
            keyboardType="number-pad"
            placeholder="e.g. 100"
          />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <TouchableOpacity style={{ flex: 1, padding: 12, backgroundColor: '#f1f5f9', borderRadius: 8 }} onPress={onCancel}>
              <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, padding: 12, backgroundColor: '#6366f1', borderRadius: 8 }} onPress={onSave}>
              <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>{saving ? 'Saving...' : 'Save'}</Text>
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
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, marginBottom: 12 },
});
