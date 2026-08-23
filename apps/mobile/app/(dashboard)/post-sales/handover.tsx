import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authClient } from '../../../lib/auth-client';
import { useAutoDialer } from '../../../hooks/useAutoDialer';

import { Lead } from '../../../components/leads/misc/lead-management-types';
import LeadListHeader from '../../../components/leads/list/LeadListHeader';
import LeadSearchBar from '../../../components/leads/list/LeadSearchBar';
import LeadListItem from '../../../components/leads/list/LeadListItem';
import AutoDialerModal from '../../../components/leads/modals/AutoDialerModal';

export default function PostSalesHandoverList() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const { followUpDate } = useLocalSearchParams();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Auto Dialer Selection State
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const {
    queue, currentIndex, currentLead, dialerState, countdown,
    startDialer, cancelDialer
  } = useAutoDialer();

  useEffect(() => {
    fetchLeads();
  }, [followUpDate]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const params = new URLSearchParams();
      params.append('status', 'HANDOVER');
      if (followUpDate) params.append('followUpDate', followUpDate as string);

      const { data, error } = await authClient.$fetch<Lead[]>(`/api/leads?${params.toString()}`, { baseURL });
      
      if (data) {
        // Filter by subStatus === 'DONE' and remove duplicates
        const completedHandovers = data.filter((lead: any) => lead.subStatus === 'DONE');
        const uniqueLeads = Array.from(new Map(completedHandovers.map(item => [item.id, item])).values());
        
        // Sort by descending created date
        uniqueLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setLeads(uniqueLeads);
      }
    } catch (error) {
      console.error('Error fetching handovers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead =>
    (lead.firstName + ' ' + (lead.lastName || '')).toLowerCase().includes(search.toLowerCase()) ||
    lead.phone.includes(search)
  );

  const toggleSelection = (id: string) => {
    setSelectedLeads(prev => {
      if (prev.includes(id)) {
        return prev.filter(l => l !== id);
      }
      if (prev.length >= 10) {
        // Enforce max 10 for dialer
        return prev;
      }
      return [...prev, id];
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f8fafc]">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-500 mt-4 font-medium">Loading completed handovers...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <LeadListHeader
        selectionMode={selectionMode}
        setSelectionMode={setSelectionMode}
        clearSelection={() => setSelectedLeads([])}
        title="Completed Handovers"
      />

      <LeadSearchBar
        search={search}
        setSearch={setSearch}
        selectionMode={selectionMode}
        selectedLeads={selectedLeads}
        leads={leads}
        startDialer={startDialer}
      />

      <FlatList
        data={filteredLeads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LeadListItem
            item={item}
            selectionMode={selectionMode}
            isSelected={selectedLeads.includes(item.id)}
            toggleSelection={toggleSelection}
            onPressLead={(id) => router.push({ pathname: '/(dashboard)/post-sales/lead-management/[id]', params: { id } } as any)}
            onLongPressLead={(id) => {
              setSelectionMode(true);
              toggleSelection(id);
            }}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="py-12 items-center justify-center">
            <Text className="text-gray-400 font-medium">No completed handovers found.</Text>
          </View>
        }
      />

      <AutoDialerModal
        dialerState={dialerState}
        queue={queue}
        currentIndex={currentIndex}
        currentLead={currentLead}
        countdown={countdown}
        cancelDialer={cancelDialer}
      />
    </View>
  );
}
