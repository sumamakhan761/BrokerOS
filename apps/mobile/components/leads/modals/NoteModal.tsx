import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface NoteModalProps {
  isVisible: boolean;
  onClose: () => void;
  newNoteContent: string;
  setNewNoteContent: (text: string) => void;
  saveNote: () => Promise<void>;
}

export default function NoteModal({ isVisible, onClose, newNoteContent, setNewNoteContent, saveNote }: NoteModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving || !newNoteContent.trim()) return;
    setIsSaving(true);
    try {
      await saveNote();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 shadow-xl">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">Add Note</Text>
            <TouchableOpacity onPress={onClose}><Feather name="x" size={24} color="#64748b" /></TouchableOpacity>
          </View>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[120px] text-gray-900 mb-6"
            placeholder="Type your note here..."
            multiline
            textAlignVertical="top"
            value={newNoteContent}
            onChangeText={setNewNoteContent}
            editable={!isSaving}
          />
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            className={`p-4 rounded-xl items-center mb-6 flex-row justify-center ${isSaving ? 'bg-blue-400' : 'bg-blue-600'}`}
          >
            {isSaving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-lg">Save Note</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
