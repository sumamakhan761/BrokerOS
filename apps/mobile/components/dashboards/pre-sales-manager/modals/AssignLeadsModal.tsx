import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

interface AssignLeadsModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCount: number;
  assignTarget: string;
  setAssignTarget: (val: string) => void;
  subordinates: any[];
  onConfirm: () => void;
}

export function AssignLeadsModal({
  visible, onClose, selectedCount, assignTarget, setAssignTarget, subordinates, onConfirm
}: AssignLeadsModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">Assign {selectedCount} Leads</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-600 mb-2">Select an employee to assign these leads to:</Text>

          <View className="border border-gray-200 rounded-lg mb-6 overflow-hidden">
            <Picker
              selectedValue={assignTarget}
              onValueChange={(itemValue) => setAssignTarget(itemValue)}
              style={{ backgroundColor: '#fff', color: '#0f172a' }}
              dropdownIconColor="#0f172a"
            >
              <Picker.Item label="Select Employee..." value="" color="#9CA3AF" />
              {subordinates.map((sub) => (
                <Picker.Item key={sub.id} label={sub.name || sub.username} value={sub.id} color="#0f172a" />
              ))}
            </Picker>
          </View>

          <TouchableOpacity onPress={onConfirm} className="bg-blue-600 py-3 rounded-xl items-center">
            <Text className="text-white font-bold text-lg">Confirm Assignment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  }
});
