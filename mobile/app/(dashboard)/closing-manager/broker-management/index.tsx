import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import BrokerListCard from '@/components/brokers/BrokerListCard';

export default function ClosingManagerBrokerManagement() {
  const router = useRouter();
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadBrokers = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
      const res = await authClient.$fetch(`${baseUrl}/api/brokers`);
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
    }, [])
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
            onPress={() => router.push(`/closing-manager/broker-management/${broker.id}`)}
            onAssign={undefined} // Closing Manager cannot assign sourcing managers
          />
        ))}

        {filteredBrokers.length === 0 && !loading && (
          <View className="py-10 items-center justify-center">
            <Feather name="users" size={40} color="#cbd5e1" />
            <Text className="text-slate-500 mt-4 font-medium">No brokers found</Text>
          </View>
        )}
      </ScrollView>

      {/* Note: Closing Manager does NOT get the "Add Broker" FAB */}
    </View>
  );
}
