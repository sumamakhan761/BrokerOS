import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { authClient } from '@/lib/auth-client';
import { useAutoDialer } from '@/hooks/useAutoDialer';

import { Lead } from '@/components/leads/misc/lead-management-types';
import LeadListHeader from '@/components/leads/list/LeadListHeader';
import LeadSearchBar from '@/components/leads/list/LeadSearchBar';
import LeadListItem from '@/components/leads/list/LeadListItem';
import LeadFilters from '@/components/leads/list/LeadFilters';
import AutoDialerModal from '@/components/leads/modals/AutoDialerModal';
import ClosingManagerNewLeadModal from '@/components/leads/modals/ClosingManagerNewLeadModal';

export default function CPCustomerManagementList() {
  const { data: session } = authClient.useSession();
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

  // Auto Dialer Selection State
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  // New Lead Modal State
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  const {
    queue, currentIndex, currentLead, dialerState, countdown,
    startDialer, cancelDialer
  } = useAutoDialer();

  useEffect(() => {
    fetchLeads();
  }, [followUpDate, status, scoreRange, filterFollowUpDate, siteVisitDate]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const statusesToFetch = ['NEW', 'BOOKING', 'DOCUMENT', 'LOAN', 'AGREEMENT', 'HANDOVER'];
      
      let allLeads: Lead[] = [];
      
      for (const st of statusesToFetch) {
        if (status && status !== st) continue;

        const params = new URLSearchParams();
        params.append('status', st);
        params.append('isCpProject', 'true');
        if (filterFollowUpDate) params.append('followUpDate', filterFollowUpDate);
        if (scoreRange) params.append('scoreRange', scoreRange);
        if (siteVisitDate) params.append('siteVisitDate', siteVisitDate);

        const { data, error } = await authClient.$fetch<Lead[]>(`/api/leads?${params.toString()}`, { baseURL });
        if (data) {
          allLeads = [...allLeads, ...data];
        }
      }
      
      // Remove duplicates
      const uniqueLeads = Array.from(new Map(allLeads.map(item => [item.id, item])).values());
      // Sort by descending created date
      uniqueLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setLeads(uniqueLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
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
        return prev;
      }
      return [...prev, id];
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f8fafc]">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-500 mt-4 font-medium">Loading customers...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <LeadListHeader
        selectionMode={selectionMode}
        setSelectionMode={setSelectionMode}
        clearSelection={() => setSelectedLeads([])}
        title="Customer Management"
      />

      <LeadSearchBar
        search={search}
        setSearch={setSearch}
        selectionMode={selectionMode}
        selectedLeads={selectedLeads}
        leads={leads}
        startDialer={startDialer}
      />

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
        renderItem={({ item }) => (
          <LeadListItem
            item={item}
            selectionMode={selectionMode}
            isSelected={selectedLeads.includes(item.id)}
            toggleSelection={toggleSelection}
            onPressLead={(id) => router.push({ pathname: '/(dashboard)/channel-partner/customer-management/[id]', params: { id } } as any)}
            onLongPressLead={(id) => {
              setSelectionMode(true);
              toggleSelection(id);
            }}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {!selectionMode && (
        <TouchableOpacity
          onPress={() => setIsNewLeadModalOpen(true)}
          className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center shadow-lg shadow-indigo-600/30"
          activeOpacity={0.8}
        >
          <Feather name="plus" size={28} color="white" />
        </TouchableOpacity>
      )}

      <AutoDialerModal
        dialerState={dialerState}
        queue={queue}
        currentIndex={currentIndex}
        currentLead={currentLead}
        countdown={countdown}
        cancelDialer={cancelDialer}
      />

      <ClosingManagerNewLeadModal
        isVisible={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onSuccess={() => {
          setIsNewLeadModalOpen(false);
          fetchLeads();
        }}
      />
    </View>
  );
}
