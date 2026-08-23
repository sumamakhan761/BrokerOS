import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import BrokerListCard from '@/components/brokers/BrokerListCard';
import { BrokerAddModal } from '@/components/brokers/BrokerAddModal';
import { AssignSourcingManagerModal } from '@/components/brokers/AssignSourcingManagerModal';
import BrokerFilters from '@/components/brokers/BrokerFilters';
import { useLocalSearchParams } from 'expo-router';

export default function ChannelPartnerBrokerManagement() {
  const router = useRouter();
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { followUpDate } = useLocalSearchParams();
  const [status, setStatus] = useState('');
  const [filterFollowUpDate, setFilterFollowUpDate] = useState((followUpDate as string) || '');

  useEffect(() => {
    setFilterFollowUpDate((followUpDate as string) || '');
  }, [followUpDate]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assignModalData, setAssignModalData] = useState<{
    isOpen: boolean;
    brokerId: string;
    brokerName: string;
    currentSourcingManagerId?: string | null;
  }>({
    isOpen: false,
    brokerId: '',
    brokerName: '',
    currentSourcingManagerId: null
  });

  const loadBrokers = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
      
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (filterFollowUpDate) params.append('followUpDate', filterFollowUpDate);

      const res = await authClient.$fetch(`${baseUrl}/api/brokers?${params.toString()}`);
      if (res.data) {
        setBrokers(res.data as any[]);
      } else if (res.error) {
        throw new Error(res.error.message);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load brokers');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBrokers();
    }, [status, filterFollowUpDate])
  );

  const filteredBrokers = brokers.filter(b => {
    const searchString = search.toLowerCase();
    return (
      b.name?.toLowerCase().includes(searchString) ||
      b.companyName?.toLowerCase().includes(searchString) ||
      b.phone?.toLowerCase().includes(searchString)
    );
  });

  if (loading && brokers.length === 0) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <View className="p-4 bg-white border-b border-gray-200 shadow-sm flex-row items-center justify-between z-10 pt-12">
        <Text className="text-xl font-bold text-gray-900">Brokers</Text>
      </View>

      <View className="px-4 py-2 bg-white">
        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
          <Feather name="search" size={18} color="#94a3b8" />
          <TextInput
            placeholder="Search brokers..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 text-base text-gray-900 h-8"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <BrokerFilters
        status={status}
        setStatus={setStatus}
        followUpDate={filterFollowUpDate}
        setFollowUpDate={setFilterFollowUpDate}
      />

      {/* List */}
      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {error && (
          <View className="bg-red-50 p-4 rounded-xl mb-4 border border-red-100">
            <Text className="text-red-600">{error}</Text>
          </View>
        )}

        {filteredBrokers.map(broker => (
          <BrokerListCard
            key={broker.id}
            broker={broker}
            showAssignee={true}
            onPress={() => router.push(`/channel-partner/broker-management/${broker.id}`)}
            onAssign={() => setAssignModalData({
              isOpen: true,
              brokerId: broker.id,
              brokerName: broker.companyName || broker.name,
              currentSourcingManagerId: broker.sourcingManagerId
            })}
          />
        ))}

        {filteredBrokers.length === 0 && !loading && (
          <View className="py-10 items-center justify-center">
            <Feather name="users" size={40} color="#cbd5e1" />
            <Text className="text-slate-500 mt-4 font-medium">No brokers found</Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setIsAddModalOpen(true)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center shadow-lg shadow-indigo-600/30"
      >
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>

      <BrokerAddModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadBrokers}
        isCP={true}
      />

      <AssignSourcingManagerModal
        isOpen={assignModalData.isOpen}
        onClose={() => setAssignModalData(prev => ({ ...prev, isOpen: false }))}
        brokerId={assignModalData.brokerId}
        brokerName={assignModalData.brokerName}
        currentSourcingManagerId={assignModalData.currentSourcingManagerId}
        onSuccess={loadBrokers}
      />
    </View>
  );
}
