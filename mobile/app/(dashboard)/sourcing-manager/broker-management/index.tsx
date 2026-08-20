import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { authClient } from '../../../../lib/auth-client';
import BrokerListCard from '../../../../components/brokers/BrokerListCard';
import { BrokerAddModal } from '../../../../components/brokers/BrokerAddModal';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BrokerFilters from '../../../../components/brokers/BrokerFilters';

export default function BrokerManagementIndex() {
  const router = useRouter();
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { followUpDate } = useLocalSearchParams();
  const [status, setStatus] = useState('');
  const [filterFollowUpDate, setFilterFollowUpDate] = useState((followUpDate as string) || '');

  useEffect(() => {
    setFilterFollowUpDate((followUpDate as string) || '');
  }, [followUpDate]);

  useEffect(() => {
    loadBrokers();
  }, [status, filterFollowUpDate]);

  const loadBrokers = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (filterFollowUpDate) params.append('followUpDate', filterFollowUpDate);

      const res = await authClient.$fetch(`/api/brokers?${params.toString()}`, { baseURL: baseUrl });
      if (!res.error) {
        setBrokers(res.data as any[]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredBrokers = brokers.filter(b =>
    (b.name + b.companyName + b.phone).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <View className="p-4 bg-white border-b border-gray-200 shadow-sm flex-row items-center justify-between z-10 pt-12">
        <Text className="text-xl font-bold text-gray-900">Brokers</Text>
        <TouchableOpacity
          onPress={() => setIsAddModalOpen(true)}
          className="w-8 h-8 bg-indigo-600 rounded-full items-center justify-center shadow-sm"
        >
          <Feather name="plus" size={16} color="#fff" />
        </TouchableOpacity>
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

      {loading ? (
        <View className="flex-1 justify-center items-center bg-[#f8fafc]">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={filteredBrokers}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="py-20 items-center justify-center">
              <Feather name="users" size={48} color="#cbd5e1" />
              <Text className="text-lg font-bold text-gray-900 mt-4">No Brokers Found</Text>
              <Text className="text-gray-500 text-center mt-2 px-8">Try adjusting your search or add a new broker.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <BrokerListCard
              broker={item}
              onPress={() => router.push(`/sourcing-manager/broker-management/${item.id}`)}
            />
          )}
        />
      )}

      <BrokerAddModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          loadBrokers();
        }}
      />
    </View>
  );
}
