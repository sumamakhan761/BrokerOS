import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { authClient } from '../../../lib/auth-client';
import { getAvailableStatusesForRole } from '../../../lib/status-utils';

import { LeadProfileData } from '../misc/lead-profile-types';
import ProfileHeader from './ProfileHeader';
import ActionButtons from './ActionButtons';
import AINextStep from './AINextStep';
import LeadDetails from './LeadDetails';
import SchedulesTimeline from '../timeline/SchedulesTimeline';
import NotesTimeline from '../timeline/NotesTimeline';
import HistoryTimeline from '../timeline/HistoryTimeline';
import StatusModal from '../modals/StatusModal';
import TemperatureModal from '../modals/TemperatureModal';
import NoteModal from '../modals/NoteModal';
import FollowUpModal from '../modals/FollowUpModal';
import SiteVisitModal from '../modals/SiteVisitModal';
import CompletedSiteVisits from '../misc/CompletedSiteVisits';
import NegotiationHistory from '../timeline/NegotiationHistory';
import BookingCard from '../booking/BookingCard';
import PostSalesPipelineCards from '../booking/PostSalesPipelineCards';
import { MobilePaymentScheduleCard } from '../../payments/MobilePaymentScheduleCard';

interface LeadProfileClientProps {
  leadId: string;
  role: 'pre-sales' | 'pre-sales-manager' | 'sales-executive' | 'sales-manager' | 'post-sales' | 'closing-manager' | 'channel-partner';
}

export default function LeadProfileClient({ leadId, role }: LeadProfileClientProps) {
  const [lead, setLead] = useState<LeadProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const isSalesExecOrManager = role === 'sales-executive' || role === 'sales-manager';
  const isPostSales = role === 'post-sales' || role === 'closing-manager' || role === 'channel-partner';
  const showSiteVisitScheduling = role !== 'post-sales' && role !== 'closing-manager' && role !== 'channel-partner';

  const [booking, setBooking] = useState<any>(null);

  // Modals state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isTemperatureModalOpen, setIsTemperatureModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isSiteVisitModalOpen, setIsSiteVisitModalOpen] = useState(false);

  const [editingFollowUpId, setEditingFollowUpId] = useState<string | null>(null);
  const [editingSiteVisitId, setEditingSiteVisitId] = useState<string | null>(null);

  // Forms state
  const [newNoteContent, setNewNoteContent] = useState('');
  const [followUpData, setFollowUpData] = useState({ title: '', description: '', date: '' });
  const [siteVisitData, setSiteVisitData] = useState<{ projectId: string; description: string; date: string; destinationUrl?: string }>({ projectId: '', description: '', date: '', destinationUrl: '' });

  const [showFollowUpDatePicker, setShowFollowUpDatePicker] = useState(false);
  const [showFollowUpTimePicker, setShowFollowUpTimePicker] = useState(false);
  const [showSiteVisitDatePicker, setShowSiteVisitDatePicker] = useState(false);
  const [showSiteVisitTimePicker, setShowSiteVisitTimePicker] = useState(false);

  const [availableProjects, setAvailableProjects] = useState<{ id: string; name: string }[]>([]);
  const [availableSources, setAvailableSources] = useState<{ id: string; name: string }[]>([]);

  const [isEditingLeadInfo, setIsEditingLeadInfo] = useState(false);
  const [leadInfoData, setLeadInfoData] = useState({
    budget: '',
    lastContactDate: '',
    nextFollowUpDate: '',
    sourceId: '',
    interestedProjectId: '',
    preferredLocation: '',
    requirements: '',
  });

  useEffect(() => {
    fetchLead();
    fetchProjects();
    fetchSources();
    fetchBooking();
  }, [leadId]);

  const fetchBooking = async () => {
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { data, error } = await authClient.$fetch<any>(`/api/leads/${leadId}/booking`, { baseURL });
      if (!error && data) {
        setBooking(data);
      } else {
        setBooking(null);
      }
    } catch (error) {
      console.error('Error fetching booking', error);
      setBooking(null);
    }
  };

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

      if (role === 'sales-executive') {
        projects = projects.filter((p: any) => p.isCpProject === false);
      }
      setAvailableProjects(projects);
    } catch (error) {
      console.error('Error fetching projects', error);
    }
  };

  const fetchSources = async () => {
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const res = await fetch(`${baseURL}/sources`);
      if (res.ok) {
        setAvailableSources(await res.json());
      }
    } catch (error) {
      console.error('Error fetching sources', error);
    }
  };

  const handleLeadInfoSave = async () => {
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const payload: any = {};
      if (leadInfoData.budget) payload.budget = Number(leadInfoData.budget);
      if (leadInfoData.lastContactDate) payload.lastContactDate = leadInfoData.lastContactDate;
      if (leadInfoData.nextFollowUpDate) payload.nextFollowUpDate = leadInfoData.nextFollowUpDate;
      if (leadInfoData.sourceId) payload.sourceId = leadInfoData.sourceId;
      if (leadInfoData.interestedProjectId) payload.interestedProjectId = leadInfoData.interestedProjectId;
      payload.preferredLocation = leadInfoData.preferredLocation;
      payload.requirements = leadInfoData.requirements;

      const { error, data } = await authClient.$fetch<LeadProfileData>(`${baseURL}/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });

      if (!error && data) {
        setLead(data);
        setIsEditingLeadInfo(false);
      }
    } catch (e) {
      console.error('Failed to update lead info:', e);
    }
  };

  const [isAiAdvancing, setIsAiAdvancing] = useState(false);

  const handleAiAutoAdvance = async () => {
    setIsAiAdvancing(true);
    try {
      const { data: sessionData } = await authClient.getSession();
      const userId = sessionData?.user?.id;
      if (!userId) {
        Alert.alert('Error', 'You must be logged in to auto-advance.');
        setIsAiAdvancing(false);
        return;
      }

      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const res = await fetch(`${baseURL}/api/leads/${leadId}/ai-transition-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate AI auto-advance');
      }

      const data = await res.json();
      console.log('AI Auto-Advance result:', data);

      await fetchLead();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not generate AI transition note. Please try again.');
    } finally {
      setIsAiAdvancing(false);
    }
  };

  const fetchLead = async () => {
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { data, error } = await authClient.$fetch<LeadProfileData>(`/api/leads/${leadId}`, { baseURL });
      if (data) {
        setLead(data);
      } else {
        console.error('Failed to fetch lead profile', error);
        setLead(null);
      }
    } catch (error) {
      console.error('Error fetching lead profile', error);
      setLead(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        const localUri = result.assets[0].uri;
        const filename = localUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        const formData = new FormData();
        formData.append('file', { uri: localUri, name: filename, type } as any);

        const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
        const res = await fetch(`${baseURL}/api/leads/${leadId}/avatar`, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const updatedLead = await res.json();
          setLead(updatedLead);
        } else {
          Alert.alert('Error', 'Failed to upload image');
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { error } = await authClient.$fetch(`${baseURL}/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: { status: newStatus },
      });
      if (!error && lead) {
        setLead({ ...lead, status: newStatus });
        if (isPostSales) {
          fetchLead(); // Refresh for subStatus changes if needed
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsStatusModalOpen(false);
    }
  };

  const handleTemperatureChange = async (newTemp: string) => {
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { error } = await authClient.$fetch(`${baseURL}/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: { temperature: newTemp },
      });
      if (!error && lead) {
        setLead({ ...lead, temperature: newTemp });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTemperatureModalOpen(false);
    }
  };

  const saveNote = async () => {
    if (!newNoteContent.trim()) return;
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { data: sessionData } = await authClient.getSession();
      const userId = sessionData?.user?.id;
      if (!userId) return Alert.alert('Error', 'You must be logged in.');

      const { error } = await authClient.$fetch(`${baseURL}/api/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          content: newNoteContent,
          userId,
          statusAtTimeOfNote: lead?.status,
        },
      });

      if (!error) {
        setNewNoteContent('');
        setIsNoteModalOpen(false);
        fetchLead();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveFollowUp = async () => {
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { data: sessionData } = await authClient.getSession();
      const userId = sessionData?.user?.id;
      if (!userId) return Alert.alert('Error', 'You must be logged in.');

      const isEditing = !!editingFollowUpId;
      const url = isEditing
        ? `${baseURL}/api/leads/follow-ups/${editingFollowUpId}`
        : `${baseURL}/api/leads/${leadId}/follow-ups`;

      const method = isEditing ? 'PATCH' : 'POST';

      const payload: any = {
        scheduledDate: followUpData.date,
        type: followUpData.title,
        remarks: followUpData.description
      };

      if (!isEditing) {
        payload.userId = userId;
      }

      const { error } = await authClient.$fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });

      if (!error) {
        setIsFollowUpModalOpen(false);
        setFollowUpData({ title: '', description: '', date: '' });
        setEditingFollowUpId(null);
        fetchLead();
      }
    } catch (e) {
      console.error(e);
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

  const handleOpenSiteVisitModal = () => {
    if (lead?.status !== 'SITE_VISIT_SCHEDULED') {
      Alert.alert('Cannot Schedule', 'Please change the lead status to SITE VISIT SCHEDULED first.');
      return;
    }
    setIsSiteVisitModalOpen(true);
  };

  const saveSiteVisit = async () => {
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { data: sessionData } = await authClient.getSession();
      const userId = sessionData?.user?.id;
      if (!userId) return Alert.alert('Error', 'You must be logged in.');

      const isEditing = !!editingSiteVisitId;
      const url = isEditing
        ? `${baseURL}/api/leads/site-visits/${editingSiteVisitId}`
        : `${baseURL}/api/leads/${leadId}/site-visits`;

      const method = isEditing ? 'PATCH' : 'POST';

      const payload: any = {
        projectId: siteVisitData.projectId,
        scheduledDate: siteVisitData.date,
        meetingNotes: siteVisitData.description,
        destinationUrl: siteVisitData.destinationUrl || undefined
      };

      if (!isEditing) {
        payload.userId = userId;
      }

      const { error } = await authClient.$fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });

      if (!error) {
        setIsSiteVisitModalOpen(false);
        setSiteVisitData({ projectId: '', description: '', date: '', destinationUrl: '' });
        setEditingSiteVisitId(null);
        fetchLead();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditSiteVisit = (sv: any) => {
    setSiteVisitData({
      projectId: sv.project?.id || sv.projectId || '',
      description: sv.meetingNotes || '',
      date: sv.scheduledDate || '',
      destinationUrl: sv.destinationUrl || ''
    });
    setEditingSiteVisitId(sv.id);
    setIsSiteVisitModalOpen(true);
  };

  const handleArriveAtSiteVisit = async (svId: string) => {
    try {
      // Lazy import location to avoid web issues if not handled
      const Location = await import('expo-location');
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const { data, error } = await authClient.$fetch(`/api/leads/${leadId}/site-visits/${svId}/arrive`, {
        baseURL: baseURL,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
      });
      if (!error) {
        Alert.alert('Success', 'Arrival confirmed!');
        fetchLead();
      } else {
        Alert.alert('Error', error.message || 'Failed to confirm arrival');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not fetch location');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f8fafc]">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!lead) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f8fafc]">
        <Text className="text-gray-500">Lead not found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <ProfileHeader
        lead={lead}
        uploading={uploading}
        handleAvatarUpload={handleAvatarUpload}
        setIsStatusModalOpen={setIsStatusModalOpen}
        setIsTemperatureModalOpen={setIsTemperatureModalOpen}
        handleAiAutoAdvance={handleAiAutoAdvance}
        isAiAdvancing={isAiAdvancing}
        isPreSales={role.includes('pre-sales')}
      />

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <ActionButtons
          lead={lead}
          handleOpenSiteVisitModal={() => {
            setSiteVisitData({ projectId: '', description: '', date: '', destinationUrl: '' });
            setEditingSiteVisitId(null);
            handleOpenSiteVisitModal();
          }}
          setIsFollowUpModalOpen={(isOpen) => {
            if (isOpen) {
              setFollowUpData({ title: '', description: '', date: '' });
              setEditingFollowUpId(null);
            }
            setIsFollowUpModalOpen(isOpen);
          }}
        />

        <AINextStep suggestion={lead.aiNextStepSuggestion} />

        <LeadDetails
          lead={lead}
          isEditingLeadInfo={isEditingLeadInfo}
          setIsEditingLeadInfo={setIsEditingLeadInfo}
          leadInfoData={leadInfoData}
          setLeadInfoData={setLeadInfoData}
          handleLeadInfoSave={handleLeadInfoSave}
          availableSources={availableSources}
          availableProjects={availableProjects}
        />

        <SchedulesTimeline
          siteVisits={lead.siteVisits?.filter((sv: any) => sv.status === 'SCHEDULED' && !sv.completedAt)}
          followUps={lead.followUps}
          onEditSiteVisit={handleEditSiteVisit}
          onEditFollowUp={handleEditFollowUp}
          onArriveAtSiteVisit={handleArriveAtSiteVisit}
        />

        {(isSalesExecOrManager) && (
          <View className="mt-4">
            <CompletedSiteVisits siteVisits={lead.siteVisits || []} onRefresh={fetchLead} />
            <NegotiationHistory notes={lead.notes || []} leadId={leadId as string} onRefresh={fetchLead} />
            <BookingCard booking={booking} leadId={leadId as string} onRefresh={fetchBooking} lead={lead} />
          </View>
        )}

        {isPostSales && (
          <View className="my-4">
            <Text className="text-gray-800 font-bold mb-3 text-lg">Post-Sales Management</Text>

            {/* Payment Schedule Card – Closing Manager Priority Feature */}
            {role === 'closing-manager' && booking && (
              <MobilePaymentScheduleCard
                bookingId={booking.id}
                agreedPrice={booking.agreedPrice || 0}
                bookingAmount={booking.bookingAmount || 0}
              />
            )}

            <BookingCard
              booking={booking}
              leadId={leadId as string}
              onRefresh={() => {
                fetchBooking();
                fetchLead();
              }}
              lead={lead}
            />
            <PostSalesPipelineCards
              leadId={leadId as string}
              leadStatus={lead.status}
              leadSubStatus={lead.subStatus || ''}
              booking={booking}
              onRefresh={() => {
                fetchBooking();
                fetchLead();
              }}
            />
          </View>
        )}

        <NotesTimeline notes={lead.notes} setIsNoteModalOpen={setIsNoteModalOpen} />

        <HistoryTimeline lead={lead} />
      </ScrollView>

      {/* Modals */}
      <StatusModal
        isVisible={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        currentStatus={lead.status}
        onStatusChange={handleStatusChange}
        availableStatuses={getAvailableStatusesForRole(role)}
      />

      <TemperatureModal
        isVisible={isTemperatureModalOpen}
        onClose={() => setIsTemperatureModalOpen(false)}
        currentTemperature={lead.temperature}
        onTemperatureChange={handleTemperatureChange}
      />

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
        isEditing={!!editingFollowUpId}
      />

      {showSiteVisitScheduling && (
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
          isEditing={!!editingSiteVisitId}
        />
      )}
    </View>
  );
}
