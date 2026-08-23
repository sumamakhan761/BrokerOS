import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { authClient } from '../../../lib/auth-client';
import ClosingManagerHandoverModal from '../modals/ClosingManagerHandoverModal';

export default function ClosingManagerHandoverScreen() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;

      const statuses = activeTab === 'pending'
        ? ['BOOKING', 'AGREEMENT']
        : ['HANDOVER', 'SOLD'];

      let allLeads: any[] = [];

      for (const st of statuses) {
        // We use isCpProject=true or maybe we just fetch all that are relevant. 
        // Following web app logic, we pass isCpProject=true.
        const res = await authClient.$fetch<any[]>(`/api/leads?status=${st}&isCpProject=true`, { baseURL });
        if (res.data) {
          allLeads = [...allLeads, ...res.data];
        }
      }

      // Unique leads
      let uniqueLeads = Array.from(new Map(allLeads.map(item => [item.id, item])).values());
      uniqueLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setLeads(uniqueLeads);
    } catch (e) {
      console.error('Failed to fetch handover leads:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [activeTab]);

  const renderLead = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(dashboard)/closing-manager/lead-management/${item.id}`)}
      className="bg-white p-5 rounded-2xl mb-3 shadow-sm border border-gray-100 flex-row items-center justify-between"
    >
      <View className="flex-1 mr-4">
        <Text className="text-lg font-bold text-gray-900 mb-1">{item.firstName} {item.lastName}</Text>
        <View className="flex-row items-center mb-2">
          <Feather name="phone" size={14} color="#64748b" />
          <Text className="text-gray-500 ml-1 text-sm">{item.phone}</Text>
        </View>
        <View className="flex-row">
          <View className="bg-blue-100 px-2 py-1 rounded-md">
            <Text className="text-blue-800 text-xs font-bold">{item.status}</Text>
          </View>
        </View>
      </View>

      <View>
        {activeTab === 'pending' ? (
          <TouchableOpacity
            onPress={() => setSelectedLead(item)}
            className="bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl flex-row items-center"
          >
            <Feather name="clipboard" size={14} color="#4f46e5" />
            <Text className="text-indigo-700 font-bold text-sm ml-2">Handover</Text>
          </TouchableOpacity>
        ) : (
          <View className="bg-green-50 border border-green-200 px-4 py-2 rounded-xl flex-row items-center">
            <Feather name="check-circle" size={14} color="#16a34a" />
            <Text className="text-green-700 font-bold text-sm ml-2">Done</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <View className="p-5 bg-white border-b border-gray-200 shadow-sm">
        <View className="flex-row items-center mb-1">
          <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-3">
            <Feather name="clipboard" size={20} color="#4f46e5" />
          </View>
          <View>
            <Text className="text-xl font-bold text-gray-900">
              {activeTab === 'pending' ? 'Ready for Handover' : 'Completed Handovers'}
            </Text>
            <Text className="text-gray-500 text-xs">
              {activeTab === 'pending'
                ? 'Leads ready to move to Post Sales'
                : 'Leads successfully handed over'}
            </Text>
          </View>
        </View>

        <View className="flex-row bg-gray-100 p-1 rounded-xl mt-4">
          <TouchableOpacity
            onPress={() => setActiveTab('pending')}
            className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === 'pending' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`font-bold ${activeTab === 'pending' ? 'text-indigo-600' : 'text-gray-500'}`}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('completed')}
            className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === 'completed' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`font-bold ${activeTab === 'completed' ? 'text-indigo-600' : 'text-gray-500'}`}>Completed</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={leads}
          keyExtractor={(item) => item.id}
          renderItem={renderLead}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Feather name="inbox" size={48} color="#cbd5e1" />
              <Text className="text-gray-400 mt-4 font-bold text-lg">
                {activeTab === 'pending' ? 'No pending handovers.' : 'No completed handovers.'}
              </Text>
            </View>
          }
        />
      )}

      {selectedLead && (
        <ClosingManagerHandoverModal
          isVisible={!!selectedLead}
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onSuccess={() => {
            setSelectedLead(null);
            fetchLeads();
          }}
        />
      )}
    </View>
  );
}
