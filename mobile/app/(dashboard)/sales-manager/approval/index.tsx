import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { authClient } from '@/lib/auth-client';
import ApprovalTicket from '@/components/approvals/ApprovalTicket';

export default function SalesManagerApprovalScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicketData, setSelectedTicketData] = useState<any | null>(null);
  const [ticketLoading, setTicketLoading] = useState(false);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
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
        role="SALES_MANAGER"
        onBack={() => { setSelectedTicketId(null); fetchRequests(); }}
        onUpdate={() => fetchTicketDetails(selectedTicketId)}
      />
    );
  }

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <View className="p-6 pb-4 border-b border-gray-100 bg-white">
        <Text className="text-2xl font-bold text-slate-800">Team Approvals</Text>
        <Text className="text-slate-500">Review and manage requests from your team.</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : requests.length === 0 ? (
        <View className="flex-1 justify-center items-center p-6">
          <View className="w-20 h-20 bg-green-50 rounded-full items-center justify-center mb-4">
            <Feather name="check" size={32} color="#16a34a" />
          </View>
          <Text className="text-lg font-bold text-slate-800 mb-1">All caught up!</Text>
          <Text className="text-slate-500 text-center">There are no pending requests from your team.</Text>
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
                <View className="flex-row items-center">
                  {item.type === 'BOOKING' && (
                    <View className="bg-indigo-100 px-2 py-1 rounded mr-2">
                      <Text className="text-[10px] font-bold text-indigo-700">{item.type}</Text>
                    </View>
                  )}
                  <View className={`px-2 py-1 rounded-full ${getStatusColor(item.status).split(' ')[0]}`}>
                    <Text className={`text-[10px] font-bold ${getStatusColor(item.status).split(' ')[1]}`}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="flex-row justify-between items-center pt-2 border-t border-slate-50">
                <View className="flex-row items-center">
                  <Feather name="user" size={12} color="#64748b" />
                  <Text className="text-xs font-semibold text-slate-700 ml-1">{item.salesExec?.name || '-'}</Text>
                </View>
                <Text className="text-xs text-slate-400">{new Date(item.updatedAt).toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
