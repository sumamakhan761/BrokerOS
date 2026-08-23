import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LeadProfileData } from '../misc/lead-profile-types';

interface NotesTimelineProps {
  notes: LeadProfileData['notes'];
  setIsNoteModalOpen: (val: boolean) => void;
}

export default function NotesTimeline({ notes, setIsNoteModalOpen }: NotesTimelineProps) {
  return (
    <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-8 shadow-sm">
      <View className="flex-row justify-between items-center mb-3 border-b border-gray-100 pb-2">
        <Text className="text-lg font-bold text-gray-900">Notes & Timeline</Text>
        <TouchableOpacity onPress={() => setIsNoteModalOpen(true)} className="bg-blue-50 p-2 rounded-full">
          <Feather name="plus" size={16} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <View className="space-y-4 pt-2">
        {(!notes || notes.length === 0) ? (
          <Text className="text-sm text-gray-400 text-center py-4">No notes yet.</Text>
        ) : (
          notes.map((note) => (
            <View key={note.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-xs font-bold text-gray-700">
                  {note.user?.displayUsername || note.user?.username || 'Unknown User'}
                </Text>
                <Text className="text-[10px] text-gray-500">
                  {new Date(note.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text className="text-sm text-gray-800">{note.content}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
