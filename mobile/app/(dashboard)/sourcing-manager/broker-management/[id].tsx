import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { authClient } from '../../../../lib/auth-client';

// Broker Specific Cards
import { BrokerHeader } from '../../../../components/brokers/profile/BrokerHeader';
import { BrokerInformationCard } from '../../../../components/brokers/profile/BrokerInformationCard';
import { BrokerDealSection } from '../../../../components/brokers/BrokerDealSection';

import { BrokerActionButtons } from '../../../../components/brokers/profile/BrokerActionButtons';
import NotesTimeline from '../../../../components/leads/timeline/NotesTimeline';
import SchedulesTimeline from '../../../../components/leads/timeline/SchedulesTimeline';
import HistoryTimeline from '../../../../components/leads/timeline/HistoryTimeline';

// Reused Modals
import NoteModal from '../../../../components/leads/modals/NoteModal';
import FollowUpModal from '../../../../components/leads/modals/FollowUpModal';
import SiteVisitModal from '../../../../components/leads/modals/SiteVisitModal';
import StatusModal from '../../../../components/leads/modals/StatusModal';

export default function SourcingManagerBrokerProfile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [broker, setBroker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isSiteVisitModalOpen, setIsSiteVisitModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isSubStatusModalOpen, setIsSubStatusModalOpen] = useState(false);

  const [editingFollowUpId, setEditingFollowUpId] = useState<string | null>(null);
  const [editingSiteVisitId, setEditingSiteVisitId] = useState<string | null>(null);

  const [newNoteContent, setNewNoteContent] = useState('');
  const [followUpData, setFollowUpData] = useState({ title: '', description: '', date: '' });
  const [siteVisitData, setSiteVisitData] = useState<{ projectId: string; description: string; date: string; destinationUrl?: string }>({ projectId: '', description: '', date: '', destinationUrl: '' });

  const [isEditingBrokerInfo, setIsEditingBrokerInfo] = useState(false);
  const [brokerInfoData, setBrokerInfoData] = useState<any>({});

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [showSiteVisitDatePicker, setShowSiteVisitDatePicker] = useState(false);
  const [showSiteVisitTimePicker, setShowSiteVisitTimePicker] = useState(false);

  const [availableProjects, setAvailableProjects] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (id) loadBroker();
    fetchProjects();
  }, [id]);

  const fetchProjects = async () => {
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { data, error } = await authClient.$fetch<any[]>('/api/users/my-projects', { baseURL });

      let projects = [];
      if (!error && data && Array.isArray(data)) {
        projects = data;
      } else {
        const res = await fetch(`${baseURL}/projects`);
        if (res.ok) projects = await res.json();
      }

      // Sourcing manager broker meetings should only use CP projects assigned to them
      projects = projects.filter((p: any) => p.isCpProject === true);
      setAvailableProjects(projects);
    } catch (error) {
      console.error('Error fetching projects', error);
    }
  };

  const loadBroker = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      const res = await authClient.$fetch(`/api/brokers/${id}`, { baseURL: baseUrl });
      if (res.error) throw new Error(res.error.message || "Failed to fetch broker");
      setBroker(res.data);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'Failed to load broker details' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      await authClient.$fetch(`/api/brokers/${id}/notes`, {
        baseURL: baseUrl,
        method: 'POST',
        body: { content: newNoteContent, type: 'GENERAL' }
      });
      setNewNoteContent('');
      await loadBroker();
      setIsNoteModalOpen(false);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'Failed to save note' });
    }
  };

  const handleBrokerInfoSave = async () => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      await authClient.$fetch(`/api/brokers/${id}`, {
        baseURL: baseUrl,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: brokerInfoData
      });
      await loadBroker();
      setIsEditingBrokerInfo(false);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Broker information updated' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'Failed to update broker info' });
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      await authClient.$fetch(`/api/brokers/${id}`, {
        baseURL: baseUrl,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: { status, subStatus: 'PENDING' }
      });
      await loadBroker();
      setIsStatusModalOpen(false);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'Failed to update status' });
    }
  };

  const handleSubStatusChange = async (subStatus: string) => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      await authClient.$fetch(`/api/brokers/${id}`, {
        baseURL: baseUrl,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: { subStatus }
      });
      await loadBroker();
      setIsSubStatusModalOpen(false);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'Failed to update sub-status' });
    }
  };

  const handleSaveFollowUp = async () => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      const method = editingFollowUpId ? 'PATCH' : 'POST';
      const url = editingFollowUpId
        ? `/api/brokers/${id}/follow-ups/${editingFollowUpId}`
        : `/api/brokers/${id}/follow-ups`;

      await authClient.$fetch(url, {
        baseURL: baseUrl,
        method: method,
        body: {
          type: followUpData.title || 'Follow Up',
          scheduledDate: followUpData.date,
          remarks: followUpData.description
        }
      });
      setFollowUpData({ title: '', description: '', date: '' });
      setEditingFollowUpId(null);
      await loadBroker();
      setIsFollowUpModalOpen(false);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'Failed to schedule follow-up' });
    }
  };

  const handleSaveSiteVisit = async () => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      const method = editingSiteVisitId ? 'PATCH' : 'POST';
      const url = editingSiteVisitId
        ? `/api/brokers/${id}/meetings/${editingSiteVisitId}`
        : `/api/brokers/${id}/meetings`;

      await authClient.$fetch(url, {
        baseURL: baseUrl,
        method: method,
        body: {
          meetingType: 'OFFICE',
          scheduledAt: siteVisitData.date,
          agenda: siteVisitData.description,
          destinationUrl: siteVisitData.destinationUrl || undefined
        }
      });
      setSiteVisitData({ projectId: '', description: '', date: '', destinationUrl: '' });
      setEditingSiteVisitId(null);
      await loadBroker();
      setIsSiteVisitModalOpen(false);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'Failed to schedule site visit' });
    }
  };

  const handleArriveAtSiteVisit = async (svId: string) => {
    try {
      const Location = await import('expo-location');
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'info', text1: 'Permission Denied', text2: 'Permission to access location was denied' });
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      const { data, error } = await authClient.$fetch(`/api/brokers/${id}/meetings/${svId}/arrive`, {
        baseURL: baseUrl,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
      });
      if (!error) {
        Toast.show({ type: 'success', text1: 'Success', text2: 'Arrival confirmed!' });
        loadBroker();
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'Failed to confirm arrival' });
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'Could not fetch location' });
    }
  };

  const handleCompleteSiteVisit = async (svId: string, formData: any) => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      await authClient.$fetch(`/api/brokers/${id}/meetings/${svId}/complete`, {
        baseURL: baseUrl,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: formData
      });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Meeting completed!' });
      await loadBroker();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'Failed to complete meeting' });
    }
  };

  const handleConfirmFollowUp = async (fuId: string) => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      await authClient.$fetch(`/api/brokers/${id}/follow-ups/${fuId}/confirm`, {
        baseURL: baseUrl,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Follow up confirmed!' });
      await loadBroker();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'Failed to confirm follow up' });
    }
  };

  const handleEditFollowUp = (fu: any) => {
    setFollowUpData({
      title: fu.type || '',
      description: fu.remarks || '',
      date: fu.scheduledDate || ''
    });
    setEditingFollowUpId(fu.id);
    setIsFollowUpModalOpen(true);
  };

  const handleEditSiteVisit = (sv: any) => {
    setSiteVisitData({
      projectId: sv.project?.id || sv.projectId || '',
      description: sv.meetingNotes || sv.remarks || '',
      date: sv.scheduledDate || '',
      destinationUrl: sv.destinationUrl || ''
    });
    setEditingSiteVisitId(sv.id);
    setIsSiteVisitModalOpen(true);
  };

  if (loading && !broker) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!broker) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-6">
        <Text className="text-xl font-bold text-slate-900 mb-2">Broker Not Found</Text>
        <Text className="text-slate-500 text-center mb-6">The broker you are looking for does not exist or you don't have access.</Text>
        <TouchableOpacity onPress={() => router.back()} className="px-6 py-3 bg-indigo-600 rounded-xl">
          <Text className="text-white font-bold text-base">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- MAPPING BROKER DATA TO LEADPROFILE DATA SHAPE ---
  // This satisfies the shared Lead components
  const mappedLead: any = {
    ...broker,
    firstName: broker.name || broker.companyName,
    lastName: '',
    phone: broker.phone || '',
    // Separate schedules into followUps and siteVisits
    followUps: (broker.followUps || []).map((s: any) => ({
      id: s.id,
      type: s.type || 'Follow Up',
      scheduledDate: s.scheduledDate,
      remarks: s.remarks,
    })),
    siteVisits: (broker.meetings || []).map((s: any) => ({
      id: s.id,
      projectId: 'OFFICE_MEETING',
      project: { id: 'OFFICE_MEETING', name: 'General Meeting' },
      scheduledDate: s.scheduledDate || s.scheduledAt,
      meetingNotes: s.meetingNotes || s.agenda,
      status: s.status || 'SCHEDULED',
      destinationUrl: s.destinationUrl,
      arrivedAt: s.arrivedAt,
      arriveLatitude: s.arriveLatitude,
      arriveLongitude: s.arriveLongitude,
      completedAt: s.actualDate,
    })),
    callRecords: (broker.calls || []).map((c: any) => ({
      id: c.id,
      recordingUrl: c.recordingUrl,
      startedAt: c.createdAt,
      duration: c.duration,
      callType: c.type,
      status: c.status
    })),
    notes: broker.notes || [],
    createdAt: broker.createdAt
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <BrokerHeader
        broker={broker}
        setIsStatusModalOpen={setIsStatusModalOpen}
        setIsSubStatusModalOpen={setIsSubStatusModalOpen}
      />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

        <BrokerActionButtons
          broker={broker}
          setIsFollowUpModalOpen={(isOpen) => {
            if (isOpen) {
              setFollowUpData({ title: '', description: '', date: '' });
              setEditingFollowUpId(null);
            }
            setIsFollowUpModalOpen(isOpen);
          }}
          handleOpenMeetingModal={() => {
            setSiteVisitData({ projectId: '', description: '', date: '', destinationUrl: '' });
            setEditingSiteVisitId(null);
            setIsSiteVisitModalOpen(true);
          }}
        />

        <BrokerInformationCard 
          broker={broker} 
          isEditingBrokerInfo={isEditingBrokerInfo}
          setIsEditingBrokerInfo={setIsEditingBrokerInfo}
          brokerInfoData={brokerInfoData}
          setBrokerInfoData={setBrokerInfoData}
          handleBrokerInfoSave={handleBrokerInfoSave}
          canEdit={true}
        />
        <BrokerDealSection broker={broker} onRefresh={loadBroker} />

        <View className="mt-6 space-y-6">
          <SchedulesTimeline
            siteVisits={mappedLead.siteVisits}
            followUps={mappedLead.followUps}
            onEditSiteVisit={handleEditSiteVisit}
            onEditFollowUp={handleEditFollowUp}
            onArriveAtSiteVisit={handleArriveAtSiteVisit}
            onCompleteSiteVisit={handleCompleteSiteVisit}
            onConfirmFollowUp={handleConfirmFollowUp}
          />

          <NotesTimeline
            notes={mappedLead.notes}
            setIsNoteModalOpen={setIsNoteModalOpen}
          />
          <HistoryTimeline
            lead={mappedLead}
          />

        </View>
      </ScrollView>

      {/* Modals */}
      <NoteModal
        isVisible={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        newNoteContent={newNoteContent}
        setNewNoteContent={setNewNoteContent}
        saveNote={handleSaveNote}
      />

      <FollowUpModal
        isVisible={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        followUpData={followUpData}
        setFollowUpData={setFollowUpData}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        showTimePicker={showTimePicker}
        setShowTimePicker={setShowTimePicker}
        saveFollowUp={handleSaveFollowUp}
        isEditing={!!editingFollowUpId}
      />

      <SiteVisitModal
        isVisible={isSiteVisitModalOpen}
        onClose={() => setIsSiteVisitModalOpen(false)}
        siteVisitData={siteVisitData}
        setSiteVisitData={setSiteVisitData}
        showDatePicker={showSiteVisitDatePicker}
        setShowDatePicker={setShowSiteVisitDatePicker}
        showTimePicker={showSiteVisitTimePicker}
        setShowTimePicker={setShowSiteVisitTimePicker}
        saveSiteVisit={handleSaveSiteVisit}
        availableProjects={availableProjects}
        isEditing={!!editingSiteVisitId}
      />

      <StatusModal
        isVisible={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        currentStatus={broker.status}
        onStatusChange={handleStatusChange}
        availableStatuses={['NEW', 'CONTACTED', 'VISIT', 'DEAL']}
      />

      <StatusModal
        isVisible={isSubStatusModalOpen}
        onClose={() => setIsSubStatusModalOpen(false)}
        currentStatus={broker.subStatus || ''}
        onStatusChange={handleSubStatusChange}
        availableStatuses={['PENDING', 'FOLLOW_UP_SCHEDULED', 'MEETING_SCHEDULED', 'NEGOTIATION', 'FINALIZED']}
      />
    </View>
  );
}
