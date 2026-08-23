import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { authClient } from '../../../../lib/auth-client';

import { Lead } from '../../../../components/leads/misc/lead-management-types';
import LeadSearchBar from '../../../../components/leads/list/LeadSearchBar';
import LeadListItem from '../../../../components/leads/list/LeadListItem';
import LeadFilters from '../../../../components/leads/list/LeadFilters';
import { useLocalSearchParams } from 'expo-router';

export default function SalesExecLeadList() {
  const router = useRouter();
  const { followUpDate, siteVisitDate: querySiteVisitDate } = useLocalSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Filter States
  const [status, setStatus] = useState((querySiteVisitDate as string) ? 'SITE_VISIT_SCHEDULED' : '');
  const [scoreRange, setScoreRange] = useState('');
  const [filterFollowUpDate, setFilterFollowUpDate] = useState((followUpDate as string) || '');

  useEffect(() => {
    setFilterFollowUpDate((followUpDate as string) || '');
  }, [followUpDate]);
  const [siteVisitDate, setSiteVisitDate] = useState((querySiteVisitDate as string) || '');

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
    (lead.firstName + ' ' + (lead.lastName || '')).toLowerCase().includes(search.toLowerCase()) ||
    (lead.phone && lead.phone.includes(search))
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f8fafc]">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <LeadSearchBar
        search={search}
        setSearch={setSearch}
        selectionMode={false}
        selectedLeads={[]}
        leads={leads}
        startDialer={() => {}}
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
            selectionMode={false}
            isSelected={false}
            toggleSelection={() => {}}
            onPressLead={(id) => router.push({ pathname: '/(dashboard)/sales-executive/lead-management/[id]', params: { id } } as any)}
            onLongPressLead={() => {}}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
