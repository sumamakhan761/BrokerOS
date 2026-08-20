import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import { useLocalSearchParams } from 'expo-router';
import { authClient } from '@/lib/auth-client';
import { BrokerHeader } from '@/components/brokers/profile/BrokerHeader';
import { BrokerInformationCard } from '@/components/brokers/profile/BrokerInformationCard';
import { BrokerDealSection } from '@/components/brokers/BrokerDealSection';


import SchedulesTimeline from '@/components/leads/timeline/SchedulesTimeline';
import NotesTimeline from '@/components/leads/timeline/NotesTimeline';
import HistoryTimeline from '@/components/leads/timeline/HistoryTimeline';
import NoteModal from '@/components/leads/modals/NoteModal';
import FollowUpModal from '@/components/leads/modals/FollowUpModal';
import SiteVisitModal from '@/components/leads/modals/SiteVisitModal';
import StatusModal from '@/components/leads/modals/StatusModal';

export default function CMBrokerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [broker, setBroker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isSiteVisitModalOpen, setIsSiteVisitModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isSubStatusModalOpen, setIsSubStatusModalOpen] = useState(false);

  // Forms state
  const [newNoteContent, setNewNoteContent] = useState('');
  const [followUpData, setFollowUpData] = useState({ title: '', description: '', date: '' });
  const [siteVisitData, setSiteVisitData] = useState<{ projectId: string; description: string; date: string; destinationUrl?: string }>({ projectId: 'OFFICE_MEETING', description: '', date: '', destinationUrl: '' });

  const [showFollowUpDatePicker, setShowFollowUpDatePicker] = useState(false);
  const [showFollowUpTimePicker, setShowFollowUpTimePicker] = useState(false);
  const [showSiteVisitDatePicker, setShowSiteVisitDatePicker] = useState(false);
  const [showSiteVisitTimePicker, setShowSiteVisitTimePicker] = useState(false);

  const [editingFollowUpId, setEditingFollowUpId] = useState<string | null>(null);
  const [editingSiteVisitId, setEditingSiteVisitId] = useState<string | null>(null);

  const availableProjects = [{ id: 'OFFICE_MEETING', name: 'General Meeting' }];

  const loadBroker = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
      const res = await authClient.$fetch(`${baseUrl}/api/brokers/${id}`);
      if (res.data) {
        setBroker(res.data);
      } else if (res.error) {
        throw new Error(res.error.message);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load broker profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadBroker();
    }
  }, [id]);

  const handleStatusChange = async (status: string) => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
      await authClient.$fetch(`${baseUrl}/api/brokers/${id}`, {
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
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
      await authClient.$fetch(`${baseUrl}/api/brokers/${id}`, {
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

  // Notes API
  const saveNote = async () => {
    if (!newNoteContent.trim()) return;
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
      const { data: sessionData } = await authClient.getSession();
      const userId = sessionData?.user?.id;
      if (!userId) { Toast.show({ type: 'error', text1: 'Error', text2: 'You must be logged in.' }); return; }

      const { error } = await authClient.$fetch(`${baseUrl}/api/brokers/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { content: newNoteContent, userId }
      });
      if (!error) {
        setNewNoteContent('');
        setIsNoteModalOpen(false);
        loadBroker();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Follow Ups API
  const saveFollowUp = async () => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
      const { data: sessionData } = await authClient.getSession();
      const userId = sessionData?.user?.id;
      if (!userId) { Toast.show({ type: 'error', text1: 'Error', text2: 'You must be logged in.' }); return; }

      const payload: any = {
        scheduledDate: followUpData.date,
        type: followUpData.title || 'CALL',
        notes: followUpData.description,
        userId
      };

      const { error } = await authClient.$fetch(`${baseUrl}/api/brokers/${id}/follow-ups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
      if (!error) {
        setIsFollowUpModalOpen(false);
        setFollowUpData({ title: '', description: '', date: '' });
        loadBroker();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Meetings (Site Visits UI mapped to meetings)
  const saveSiteVisit = async () => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
      const { data: sessionData } = await authClient.getSession();
      const userId = sessionData?.user?.id;
      if (!userId) { Toast.show({ type: 'error', text1: 'Error', text2: 'You must be logged in.' }); return; }

      const payload: any = {
        scheduledAt: siteVisitData.date,
        agenda: siteVisitData.description,
        meetingType: 'OFFICE',
        userId
      };

      const { error } = await authClient.$fetch(`${baseUrl}/api/brokers/${id}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
      if (!error) {
        setIsSiteVisitModalOpen(false);
        setSiteVisitData({ projectId: 'OFFICE_MEETING', description: '', date: '', destinationUrl: '' });
        loadBroker();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (error || !broker) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center p-4">
        <Text className="text-red-500 font-bold mb-2">Error</Text>
        <Text className="text-slate-600 text-center">{error || 'Broker not found'}</Text>
      </View>
    );
  }

  const mappedBroker: any = {
    ...broker,
    firstName: broker.name || broker.companyName,
    lastName: '',
    phone: broker.phone || '',
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
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 60 }}>
        <BrokerHeader 
          broker={broker} 
          setIsStatusModalOpen={setIsStatusModalOpen}
          setIsSubStatusModalOpen={setIsSubStatusModalOpen}
        />
        
        <View className="px-4">
          <BrokerInformationCard broker={broker} />
          
          <BrokerDealSection broker={broker} onRefresh={loadBroker} />

          <View className="mt-4">
            <SchedulesTimeline
              siteVisits={mappedBroker.siteVisits}
              followUps={mappedBroker.followUps}
              onEditSiteVisit={() => {}}
              onEditFollowUp={() => {}}
              onArriveAtSiteVisit={async () => {}}
            />
          </View>

          <View className="mt-4">
            <NotesTimeline notes={broker.notes} setIsNoteModalOpen={setIsNoteModalOpen} />
          </View>

          <View className="mt-4">
            <HistoryTimeline lead={mappedBroker} />
          </View>

        </View>
      </ScrollView>

      {/* Modals */}
      <NoteModal
        isVisible={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        newNoteContent={newNoteContent}
        setNewNoteContent={setNewNoteContent}
        saveNote={saveNote}
      />

      <FollowUpModal
        isVisible={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        followUpData={followUpData}
        setFollowUpData={setFollowUpData}
        showDatePicker={showFollowUpDatePicker}
        setShowDatePicker={setShowFollowUpDatePicker}
        showTimePicker={showFollowUpTimePicker}
        setShowTimePicker={setShowFollowUpTimePicker}
        saveFollowUp={saveFollowUp}
        isEditing={false}
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
        saveSiteVisit={saveSiteVisit}
        availableProjects={availableProjects}
        isEditing={false}
      />

      <StatusModal
        isVisible={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        currentStatus={broker?.status || ''}
        onStatusChange={handleStatusChange}
        availableStatuses={['NEW', 'CONTACTED', 'VISIT', 'DEAL']}
      />

      <StatusModal
        isVisible={isSubStatusModalOpen}
        onClose={() => setIsSubStatusModalOpen(false)}
        currentStatus={broker?.subStatus || ''}
        onStatusChange={handleSubStatusChange}
        availableStatuses={['PENDING', 'FOLLOW_UP_SCHEDULED', 'MEETING_SCHEDULED', 'NEGOTIATION', 'FINALIZED']}
      />
    </View>
  );
}
