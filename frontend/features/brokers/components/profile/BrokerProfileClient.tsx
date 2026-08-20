'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

import { BrokerInformationCard } from '@/features/brokers/components/profile/BrokerInformationCard';
import { CallRecordingsCard } from '@/features/leads/components/profile/CallRecordingsCard';
import { BrokerHeader } from '@/features/brokers/components/profile/BrokerHeader';
import { BrokerDealCard } from '@/features/brokers/components/profile/BrokerDealCard';

import { NoteModal } from '@/features/leads/components/modals/NoteModal';
import { FollowUpModal } from '@/features/leads/components/modals/FollowUpModal';
import { LeadNotesTimeline } from '@/features/leads/components/profile/LeadNotesTimeline';
import { LeadSchedulesCard } from '@/features/leads/components/profile/LeadSchedulesCard';
import { SiteVisitModal } from '@/features/leads/components/modals/SiteVisitModal';
import { SiteVisitCompleteModal } from '@/features/leads/components/modals/SiteVisitCompleteModal';
// Hooks
import { useBrokerDetails } from '@/features/brokers/hooks/useBrokerDetails';
import { useBrokerNotes } from '@/features/brokers/hooks/useBrokerNotes';
import { useBrokerSchedules } from '@/features/brokers/hooks/useBrokerSchedules';

export function BrokerProfileClient({ brokerId }: { brokerId: string }) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const pathname = usePathname() || '';
  const isCP = pathname.includes('/channel-partner');
  const isSM = pathname.includes('/sourcing-manager');
  const isCM = pathname.includes('/closing-manager');

  const {
    broker,
    setBroker,
    loading,
    isEditingHeader,
    setIsEditingHeader,
    headerFormData,
    setHeaderFormData,
    isEditingBrokerInfo,
    setIsEditingBrokerInfo,
    brokerInfoData,
    setBrokerInfoData,
    availableSourcingManagers,
    loadBroker,
    loadSourcingManagers,
    handleBrokerInfoSave,
    handleHeaderSave,
    handleSubStatusChange
  } = useBrokerDetails(brokerId, isCP);

  const {
    notes,
    updateNotesFromBroker,
    isNoteModalOpen,
    setIsNoteModalOpen,
    newNoteContent,
    setNewNoteContent,
    pendingStatusChange,
    setPendingStatusChange,
    isSavingNote,
    handleStatusChange,
    saveNote,
  } = useBrokerNotes(brokerId, userId, broker, setBroker);

  const {
    followUps,
    meetings,
    updateSchedulesFromBroker,
    isFollowUpModalOpen,
    setIsFollowUpModalOpen,
    isMeetingModalOpen,
    setIsMeetingModalOpen,
    followUpData,
    setFollowUpData,
    meetingData,
    setMeetingData,
    handleSaveFollowUp,
    handleSaveMeeting,
    openFollowUpModal,
    openMeetingModal,
  } = useBrokerSchedules(brokerId, userId, broker);

  // Map meetings to siteVisits format for LeadSchedulesCard & CallRecordingsCard
  const mappedBroker = broker ? {
    ...broker,
    siteVisits: (broker.meetings || []).map((m: any) => ({
      id: m.id,
      scheduledDate: m.scheduledDate,
      status: m.status,
      meetingNotes: m.meetingNotes,
      project: null, // or fetch project if needed
      destinationUrl: m.destinationUrl,
      arrivedAt: m.arrivedAt,
      arriveLatitude: m.arriveLatitude,
      arriveLongitude: m.arriveLongitude,
      completedAt: m.actualDate // Note: broker meeting schema uses actualDate for completion
    }))
  } : null;

  // Map meetingData to siteVisitData
  const siteVisitData = {
    projectId: 'OFFICE_MEETING', // default dummy
    date: meetingData.scheduledAt,
    description: meetingData.agenda,
  };

  const setSiteVisitData = (data: any) => {
    setMeetingData({
      title: 'Meeting',
      scheduledAt: data.date,
      meetingType: 'OFFICE',
      agenda: data.description,
    });
  };

  const [isAiAdvancing, setIsAiAdvancing] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<any[]>([
    { id: 'OFFICE_MEETING', name: 'General Meeting' }
  ]);

  useEffect(() => {
    loadBroker().then((brokerData) => {
      updateNotesFromBroker(brokerData);
      updateSchedulesFromBroker(brokerData);
    });
    if (isCP) loadSourcingManagers();

    // Fetch available projects for meetings
    async function fetchProjects() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
        const res = await authClient.$fetch('/api/inventory/projects', { baseURL: baseUrl });
        if (res.data && Array.isArray(res.data)) {
          setAvailableProjects([
            { id: 'OFFICE_MEETING', name: 'General Meeting' },
            ...(res.data as any[])
          ]);
        }
      } catch (err) {
        console.error('Failed to load projects', err);
      }
    }
    fetchProjects();
  }, [brokerId, isCP]);

  const handleAiAutoAdvance = async () => {
    setIsAiAdvancing(true);
    try {
      if (!userId) {
        toast.error('You must be logged in to auto-advance.');
        setIsAiAdvancing(false);
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${baseUrl}/api/brokers/${brokerId}/ai-transition-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Failed to generate AI auto-advance');
      }

      const brokerData = await loadBroker();
      updateNotesFromBroker(brokerData);
      updateSchedulesFromBroker(brokerData);
    } catch (error) {
      console.error(error);
      toast.error('Could not generate AI transition note. Please try again.');
    } finally {
      setIsAiAdvancing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500 animate-pulse">Loading broker profile...</div>
      </div>
    );
  }

  const backHref = isCP
    ? "/dashboard/channel-partner/broker-management"
    : isCM
      ? "/dashboard/closing-manager/broker-management"
      : "/dashboard/sourcing-manager/broker-management";

  if (!broker) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Broker not found</h2>
        <Link href={backHref} className="mt-4 text-indigo-600 hover:underline">
          Return to Brokers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link
          href={backHref}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Broker Profile</h1>
      </div>

      <BrokerHeader
        broker={broker}
        brokerId={brokerId}
        isEditing={isEditingHeader}
        setIsEditing={setIsEditingHeader}
        formData={headerFormData}
        setFormData={setHeaderFormData}
        handleSave={handleHeaderSave}
        handleStatusChange={handleStatusChange}
        handleSubStatusChange={handleSubStatusChange}
        openFollowUpModal={openFollowUpModal}
        openMeetingModal={openMeetingModal}
        handleAiAutoAdvance={handleAiAutoAdvance}
        isAiAdvancing={isAiAdvancing}
        isCM={isCM}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BrokerInformationCard
          broker={broker}
          isEditingBrokerInfo={isEditingBrokerInfo}
          setIsEditingBrokerInfo={setIsEditingBrokerInfo}
          brokerInfoData={brokerInfoData}
          setBrokerInfoData={setBrokerInfoData}
          handleBrokerInfoSave={handleBrokerInfoSave}
          availableSourcingManagers={availableSourcingManagers}
          isCP={isCP}
        />

        <LeadNotesTimeline
          notes={notes}
          setIsNoteModalOpen={setIsNoteModalOpen}
          setPendingStatusChange={() => { }}
        />

        <LeadSchedulesCard
          siteVisits={mappedBroker?.siteVisits || []}
          followUps={followUps}
          openSiteVisitModal={openMeetingModal}
          openFollowUpModal={openFollowUpModal}
          handleConfirmFollowUp={() => { }} // Stub
        />
      </div>

      <BrokerDealCard broker={broker} brokerId={brokerId} onRefresh={() => loadBroker()} />

      <CallRecordingsCard lead={mappedBroker} />

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setPendingStatusChange(null);
          setNewNoteContent('');
        }}
        newNoteContent={newNoteContent}
        setNewNoteContent={setNewNoteContent}
        saveNote={saveNote}
        isSavingNote={isSavingNote}
        pendingStatusChange={pendingStatusChange}
      />

      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        editingFollowUpId={null}
        followUpData={{ title: followUpData.title, description: followUpData.notes, date: followUpData.scheduledDate }}
        setFollowUpData={(data: any) => setFollowUpData({ title: data.title, type: 'CALL', notes: data.description, scheduledDate: data.date })}
        handleSaveFollowUp={() => handleSaveFollowUp(() => {
          loadBroker().then((brokerData) => updateSchedulesFromBroker(brokerData));
        })}
        handleDeleteFollowUp={() => { }}
      />

      <SiteVisitModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        editingSiteVisitId={null}
        siteVisitData={siteVisitData}
        setSiteVisitData={setSiteVisitData}
        handleSaveSiteVisit={() => handleSaveMeeting(() => {
          loadBroker().then((brokerData) => updateSchedulesFromBroker(brokerData));
        })}
        handleDeleteSiteVisit={() => { }}
        availableProjects={availableProjects}
      />
    </div>
  );
}
