import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface FollowUpModalProps {
  isVisible: boolean;
  onClose: () => void;
  followUpData: { title: string; description: string; date: string };
  setFollowUpData: (data: { title: string; description: string; date: string }) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  showTimePicker: boolean;
  setShowTimePicker: (show: boolean) => void;
  saveFollowUp: () => void;
  isEditing?: boolean;
}

export default function FollowUpModal({
  isVisible,
  onClose,
  followUpData,
  setFollowUpData,
  showDatePicker,
  setShowDatePicker,
  showTimePicker,
  setShowTimePicker,
  saveFollowUp,
  isEditing = false
}: FollowUpModalProps) {
  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 shadow-xl">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">{isEditing ? 'Update Follow-up' : 'Schedule Follow-up'}</Text>
            <TouchableOpacity onPress={onClose}><Feather name="x" size={24} color="#64748b" /></TouchableOpacity>
          </View>
          <View className="space-y-4 pb-6">
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-500 mb-1">Title / Type</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900"
                placeholder="e.g. Call, Meeting"
                value={followUpData.title}
                onChangeText={t => setFollowUpData({ ...followUpData, title: t })}
              />
            </View>
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-500 mb-1">Date & Time</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <Text className="text-gray-900">{followUpData.date ? new Date(followUpData.date).toLocaleString() : 'Select Date & Time'}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={followUpData.date ? new Date(followUpData.date) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const currentDate = followUpData.date ? new Date(followUpData.date) : new Date();
                      selectedDate.setHours(currentDate.getHours(), currentDate.getMinutes());
                      setFollowUpData({ ...followUpData, date: selectedDate.toISOString() });
                      setShowTimePicker(true);
                    }
                  }}
                />
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={followUpData.date ? new Date(followUpData.date) : new Date()}
                  mode="time"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowTimePicker(false);
                    if (selectedDate) {
                      const newDate = new Date(followUpData.date || new Date().toISOString());
                      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
                      setFollowUpData({ ...followUpData, date: newDate.toISOString() });
                    }
                  }}
                />
              )}
            </View>
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-500 mb-1">Remarks</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 min-h-[80px] text-gray-900"
                placeholder="Details..."
                multiline
                textAlignVertical="top"
                value={followUpData.description}
                onChangeText={t => setFollowUpData({ ...followUpData, description: t })}
              />
            </View>
            <TouchableOpacity onPress={saveFollowUp} className="bg-blue-600 p-4 rounded-xl items-center mt-2">
              <Text className="text-white font-bold">{isEditing ? 'Update' : 'Schedule'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
