import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { authClient } from '../../../../lib/auth-client';
import LeadFilters from '../../../../components/leads/list/LeadFilters';

type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  score: number;
  assignedUser?: { name: string; username: string };
};

export default function ManagerLeadManagementList() {
  const router = useRouter();
  const { followUpDate } = useLocalSearchParams();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Filter States
  const [status, setStatus] = useState('');
  const [scoreRange, setScoreRange] = useState('');
  const [filterFollowUpDate, setFilterFollowUpDate] = useState((followUpDate as string) || '');

  useEffect(() => {
    setFilterFollowUpDate((followUpDate as string) || '');
  }, [followUpDate]);
  const [siteVisitDate, setSiteVisitDate] = useState('');

  useEffect(() => {
    fetchLeads();
  }, [followUpDate, status, scoreRange, filterFollowUpDate, siteVisitDate]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const params = new URLSearchParams();
      if (filterFollowUpDate) params.append('followUpDate', filterFollowUpDate);
      if (status) params.append('status', status);
      if (scoreRange) params.append('scoreRange', scoreRange);
      if (siteVisitDate) params.append('siteVisitDate', siteVisitDate);
      
      const { data, error } = await authClient.$fetch<Lead[]>(`/api/leads?${params.toString()}`, { baseURL });
      if (data) {
        setLeads(data);
      } else {
        console.error('Failed to fetch leads', error);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead =>
    (lead.firstName + ' ' + lead.lastName).toLowerCase().includes(search.toLowerCase()) ||
    lead.phone.includes(search)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CONTACTED': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'QUALIFIED': return 'bg-green-100 text-green-700 border-green-200';
      case 'LOST': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const renderItem = ({ item }: { item: Lead }) => {
    const agentName = item.assignedUser ? (item.assignedUser.name || item.assignedUser.username) : 'Unassigned';
    
    return (
      <TouchableOpacity
        onPress={() => {
          router.push({ pathname: '/(dashboard)/pre-sales-manager/lead-management/[id]', params: { id: item.id } } as any);
        }}
        className={`bg-white p-4 mb-3 rounded-xl border border-gray-200 shadow-sm flex-row items-center`}
      >
        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-1">
            <Text className="text-base font-bold text-gray-900">{item.firstName} {item.lastName}</Text>
            <View className={`px-2 py-1 rounded-full border ${getStatusColor(item.status)}`}>
              <Text className="text-[10px] font-bold uppercase">{item.status}</Text>
            </View>
          </View>
          <View className="flex-row items-center mt-1">
            <Feather name="phone" size={12} color="#64748b" />
            <Text className="text-sm text-gray-500 ml-1">{item.phone}</Text>
          </View>
        </View>
        <View className="ml-3 items-center justify-center bg-gray-50 px-3 h-8 rounded-full border border-gray-200">
          <Text className="text-gray-700 font-bold text-xs">{agentName}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f8fafc]">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <View className="p-4 bg-white border-b border-gray-200 shadow-sm flex-row items-center justify-between z-10 pt-12">
        <Text className="text-xl font-bold text-gray-900">Team Leads</Text>
      </View>

      <View className="px-4 py-2 bg-white">
        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
          <Feather name="search" size={18} color="#94a3b8" />
          <TextInput
            placeholder="Search leads..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 text-base text-gray-900 h-8"
          />
        </View>
      </View>

      <LeadFilters
        status={status}
        setStatus={setStatus}
        scoreRange={scoreRange}
        setScoreRange={setScoreRange}
        followUpDate={filterFollowUpDate}
        setFollowUpDate={setFilterFollowUpDate}
        siteVisitDate={siteVisitDate}
        setSiteVisitDate={setSiteVisitDate}
      />

      <FlatList
        data={filteredLeads}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
