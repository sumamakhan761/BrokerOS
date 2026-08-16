// Force rebuild for env cache
import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authClient } from '../../../../lib/auth-client';
import { useAutoDialer } from '../../../../hooks/useAutoDialer';

import { Lead } from '../../../../components/leads/misc/lead-management-types';
import LeadListHeader from '../../../../components/leads/list/LeadListHeader';
import LeadSearchBar from '../../../../components/leads/list/LeadSearchBar';
import LeadFilters from '../../../../components/leads/list/LeadFilters';
import LeadListItem from '../../../../components/leads/list/LeadListItem';
import AutoDialerModal from '../../../../components/leads/modals/AutoDialerModal';

export default function LeadManagementList() {
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
  const [siteVisitDate, setSiteVisitDate] = useState('');

  useEffect(() => {
    setFilterFollowUpDate((followUpDate as string) || '');
  }, [followUpDate]);

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
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <LeadListHeader
        selectionMode={selectionMode}
        setSelectionMode={setSelectionMode}
        clearSelection={() => setSelectedLeads([])}
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
            onPressLead={(id) => router.push({ pathname: '/(dashboard)/pre-sales/lead-management/[id]', params: { id } } as any)}
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
