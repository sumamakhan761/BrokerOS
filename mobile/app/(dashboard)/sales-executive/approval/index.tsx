import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import Toast from 'react-native-toast-message';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import { authClient } from '@/lib/auth-client';
import ApprovalTicket from '@/components/approvals/ApprovalTicket';

export default function SalesExecutiveApprovalScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicketData, setSelectedTicketData] = useState<any | null>(null);
  const [ticketLoading, setTicketLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { data, error } = await authClient.$fetch<any[]>('/api/approvals', { baseURL });
      if (data) setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTicket = async (id: string) => {
    setSelectedTicketId(id);
    fetchTicketDetails(id);
  };

  const fetchTicketDetails = async (id: string) => {
    try {
      setTicketLoading(true);
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { data, error } = await authClient.$fetch<any>(`/api/approvals/${id}`, { baseURL });
      if (data) setSelectedTicketData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setTicketLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!title || !description) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Title and description are required.' });
      return;
    }

    try {
      setSubmitting(true);
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;

      let uploadedUrl = '';
      if (file) {
        const formData = new FormData();
        const filename = file.name || file.uri.split('/').pop() || 'upload.file';
        const type = file.mimeType || 'application/octet-stream';
        formData.append('file', { uri: file.uri, name: filename, type } as any);

        const uploadRes = await authClient.$fetch('/api/approvals/upload', {
          baseURL,
          method: 'POST',
          body: formData as any,
        });

        if (!uploadRes.error && uploadRes.data) {
          uploadedUrl = (uploadRes.data as any).url || '';
        } else {
          Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to upload file' });
          setSubmitting(false);
          return;
        }
      }

      const { error } = await authClient.$fetch('/api/approvals', {
        baseURL,
        method: 'POST',
        body: { title, description, fileUrl: uploadedUrl },
      });

      if (error) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to create request' });
        return;
      }

      Toast.show({ type: 'success', text1: 'Success', text2: 'Approval request created!' });
      setIsCreateModalOpen(false);
      setTitle('');
      setDescription('');
      setFile(null);
      fetchRequests();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedTicketId) {
    if (ticketLoading || !selectedTicketData) {
      return (
        <View className="flex-1 justify-center items-center bg-[#f8fafc]">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      );
    }
    return (
      <ApprovalTicket
        ticket={selectedTicketData}
        role="SALES_EXECUTIVE"
        onBack={() => { setSelectedTicketId(null); fetchRequests(); }}
        onUpdate={() => fetchTicketDetails(selectedTicketId)}
      />
    );
  }

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <View className="p-6 pb-2 border-b border-gray-100 bg-white">
        <Text className="text-2xl font-bold text-slate-800">My Approvals</Text>
        <Text className="text-slate-500 mb-4">Manage your requests</Text>
        <TouchableOpacity
          className="bg-[#2563eb] p-3 rounded-xl flex-row justify-center items-center shadow-sm"
          onPress={() => setIsCreateModalOpen(true)}
        >
          <Feather name="plus" size={18} color="white" />
          <Text className="text-white font-bold ml-2">New Request</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : requests.length === 0 ? (
        <View className="flex-1 justify-center items-center p-6">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Feather name="message-square" size={32} color="#94a3b8" />
          </View>
          <Text className="text-lg font-bold text-slate-800 mb-1">No requests found</Text>
          <Text className="text-slate-500 text-center">You haven't created any approval requests yet.</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-3"
              onPress={() => handleOpenTicket(item.id)}
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 pr-2">
                  <Text className="font-bold text-slate-800 text-base" numberOfLines={1}>
                    {item.messages[0]?.title || 'No Title'}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-1">
                    ID: #{item.id.slice(0, 8).toUpperCase()}
                  </Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${getStatusColor(item.status).split(' ')[0]}`}>
                  <Text className={`text-[10px] font-bold ${getStatusColor(item.status).split(' ')[1]}`}>
                    {item.status}
                  </Text>
                </View>
              </View>
              <View className="flex-row justify-between items-center pt-2 border-t border-slate-50">
                <Text className="text-xs text-slate-500">Manager: {item.manager?.name || '-'}</Text>
                <Text className="text-xs text-slate-400">{new Date(item.updatedAt).toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Create Modal */}
      <Modal visible={isCreateModalOpen} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-[#f8fafc]">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200 bg-white">
            <Text className="text-lg font-bold text-slate-800">Create Request</Text>
            <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
              <Feather name="x" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View className="p-6 space-y-4 flex-1">
            <View>
              <Text className="font-semibold text-slate-700 mb-2">Title</Text>
              <TextInput
                placeholder="E.g., Special Discount Approval"
                value={title}
                onChangeText={setTitle}
                className="bg-white border border-slate-200 rounded-lg p-3 text-slate-800"
              />
            </View>

            <View>
              <Text className="font-semibold text-slate-700 mb-2">Description</Text>
              <TextInput
                placeholder="Provide details about the request..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="bg-white border border-slate-200 rounded-lg p-3 text-slate-800 min-h-[100px]"
              />
            </View>

            <View>
              <Text className="font-semibold text-slate-700 mb-2">File Attachment (Optional)</Text>
              <TouchableOpacity onPress={handleSelectFile} className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex-row items-center justify-between">
                <Text className="text-slate-600 flex-1 mr-2" numberOfLines={1}>{file ? file.name : 'Select a file...'}</Text>
                {file && (
                  <TouchableOpacity onPress={() => setFile(null)}>
                    <Feather name="x-circle" size={16} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-[#2563eb] p-4 rounded-xl items-center mt-6 shadow-sm"
              onPress={handleCreateRequest}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Submit Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
