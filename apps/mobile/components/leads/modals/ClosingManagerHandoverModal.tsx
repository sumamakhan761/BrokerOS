import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { authClient } from '../../../lib/auth-client';

interface ClosingManagerHandoverModalProps {
  isVisible: boolean;
  onClose: () => void;
  lead: any;
  onSuccess: () => void;
}

export default function ClosingManagerHandoverModal({ isVisible, onClose, lead, onSuccess }: ClosingManagerHandoverModalProps) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  if (!lead) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { data: sessionData } = await authClient.getSession();
      
      const { error } = await authClient.$fetch(`${baseURL}/api/leads/${lead.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: {
          status: 'HANDOVER',
          subStatus: 'DONE',
          note: notes,
          userId: sessionData?.user?.id
        }
      });

      if (!error) {
        onSuccess();
        setNotes('');
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to handover lead' });
      }
    } catch (e: any) {
      console.error('Handover error:', e);
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'An error occurred during handover' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-black/50 justify-center items-center"
      >
        <View className="bg-white rounded-3xl w-[90%] max-w-[400px] overflow-hidden shadow-2xl">
          <View className="bg-indigo-50 p-6 items-center border-b border-indigo-100">
            <View className="w-12 h-12 rounded-full bg-indigo-100 items-center justify-center mb-3">
              <Feather name="clipboard" size={24} color="#4f46e5" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-1 text-center">Handover Lead</Text>
            <Text className="text-sm text-indigo-700 text-center font-medium">
              Are you sure you want to handover {lead.firstName} {lead.lastName}?
            </Text>
          </View>

          <ScrollView className="p-6">
            <Text className="text-sm font-bold text-gray-700 mb-2">Handover Notes (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter any notes for the handover..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-base mb-6 text-left items-start justify-start h-32"
              style={{ textAlignVertical: 'top' }}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onClose}
                disabled={loading}
                className="flex-1 py-3.5 rounded-xl border border-gray-200 items-center justify-center bg-white shadow-sm"
              >
                <Text className="text-gray-600 font-bold text-base">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className={`flex-1 py-3.5 rounded-xl items-center justify-center flex-row shadow-sm ${loading ? 'bg-indigo-400' : 'bg-indigo-600'}`}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Feather name="check" size={18} color="white" className="mr-2" />
                    <Text className="text-white font-bold text-base ml-2">Confirm</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
