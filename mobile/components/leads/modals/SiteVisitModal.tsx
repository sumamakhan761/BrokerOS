import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

interface SiteVisitModalProps {
  isVisible: boolean;
  onClose: () => void;
  siteVisitData: { projectId: string; description: string; date: string; destinationUrl?: string };
  setSiteVisitData: (data: { projectId: string; description: string; date: string; destinationUrl?: string }) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  showTimePicker: boolean;
  setShowTimePicker: (show: boolean) => void;
  saveSiteVisit: () => void;
  availableProjects?: {id: string; name: string}[];
  isEditing?: boolean;
}

export default function SiteVisitModal({
  isVisible,
  onClose,
  siteVisitData,
  setSiteVisitData,
  showDatePicker,
  setShowDatePicker,
  showTimePicker,
  setShowTimePicker,
  saveSiteVisit,
  availableProjects = [],
  isEditing = false
}: SiteVisitModalProps) {
  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 shadow-xl">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">{isEditing ? 'Update Site Visit' : 'Schedule Site Visit'}</Text>
            <TouchableOpacity onPress={onClose}><Feather name="x" size={24} color="#64748b" /></TouchableOpacity>
          </View>
          <View className="space-y-4 pb-6">
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-500 mb-1">Project</Text>
              <View className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <Picker
                  selectedValue={siteVisitData.projectId}
                  onValueChange={(itemValue) => setSiteVisitData({ ...siteVisitData, projectId: itemValue })}
                  style={{ backgroundColor: 'transparent' }}
                >
                  <Picker.Item label="Select Project" value="" color="#9ca3af" />
                  {availableProjects.map((p) => (
                    <Picker.Item key={p.id} label={p.name} value={p.id} color="#111827" />
                  ))}
                </Picker>
              </View>
            </View>
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-500 mb-1">Date & Time</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <Text className="text-gray-900">{siteVisitData.date ? new Date(siteVisitData.date).toLocaleString() : 'Select Date & Time'}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={siteVisitData.date ? new Date(siteVisitData.date) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const currentDate = siteVisitData.date ? new Date(siteVisitData.date) : new Date();
                      selectedDate.setHours(currentDate.getHours(), currentDate.getMinutes());
                      setSiteVisitData({ ...siteVisitData, date: selectedDate.toISOString() });
                      setShowTimePicker(true);
                    }
                  }}
                />
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={siteVisitData.date ? new Date(siteVisitData.date) : new Date()}
                  mode="time"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowTimePicker(false);
                    if (selectedDate) {
                      const newDate = new Date(siteVisitData.date || new Date().toISOString());
                      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
                      setSiteVisitData({ ...siteVisitData, date: newDate.toISOString() });
                    }
                  }}
                />
              )}
            </View>
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-500 mb-1">Google Maps Link (Destination)</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900"
                placeholder="https://maps.google.com/..."
                value={siteVisitData.destinationUrl || ''}
                onChangeText={t => setSiteVisitData({ ...siteVisitData, destinationUrl: t })}
              />
            </View>
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-500 mb-1">Meeting Notes</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 min-h-[80px] text-gray-900"
                placeholder="Details..."
                multiline
                textAlignVertical="top"
                value={siteVisitData.description}
                onChangeText={t => setSiteVisitData({ ...siteVisitData, description: t })}
              />
            </View>
            <TouchableOpacity onPress={saveSiteVisit} className="bg-blue-600 p-4 rounded-xl items-center mt-2">
              <Text className="text-white font-bold">{isEditing ? 'Update' : 'Schedule'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
