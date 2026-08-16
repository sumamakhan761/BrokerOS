import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authClient } from '../../../../lib/auth-client';
import { useAutoDialer } from '../../../../hooks/useAutoDialer';

import { Lead } from '../../../../components/leads/misc/lead-management-types';
import LeadListHeader from '../../../../components/leads/list/LeadListHeader';
import LeadSearchBar from '../../../../components/leads/list/LeadSearchBar';
import LeadListItem from '../../../../components/leads/list/LeadListItem';
import LeadFilters from '../../../../components/leads/list/LeadFilters';
import AutoDialerModal from '../../../../components/leads/modals/AutoDialerModal';

export default function PostSalesLeadManagementList() {
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
      const statusesToFetch = ['BOOKING', 'DOCUMENT', 'LOAN', 'AGREEMENT', 'HANDOVER'];
      
      let allLeads: Lead[] = [];
      
      for (const st of statusesToFetch) {
        if (status && status !== st) continue; // skip if specific status is selected and it doesn't match
        
        const params = new URLSearchParams();
        params.append('status', st);
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
        <Text className="text-gray-500 mt-4 font-medium">Loading post-sales leads...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <LeadListHeader
        selectionMode={selectionMode}
        setSelectionMode={setSelectionMode}
        clearSelection={() => setSelectedLeads([])}
        title="Post-Sales Pipeline"
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
            onPressLead={(id) => router.push({ pathname: '/(dashboard)/post-sales/lead-management/[id]', params: { id } } as any)}
            onLongPressLead={(id) => {
              setSelectionMode(true);
              toggleSelection(id);
            }}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
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
