"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

import { BrokerInformationCard } from "@/features/brokers/components/profile/BrokerInformationCard";
import { CallRecordingsCard } from "@/features/leads/components/profile/CallRecordingsCard";
import { BrokerHeader } from "@/features/brokers/components/profile/BrokerHeader";
import { BrokerDealCard } from "@/features/brokers/components/profile/BrokerDealCard";

import { NoteModal } from "@/features/leads/components/modals/NoteModal";
import { FollowUpModal } from "@/features/leads/components/modals/FollowUpModal";
import { LeadNotesTimeline } from "@/features/leads/components/profile/LeadNotesTimeline";
import { LeadSchedulesCard } from "@/features/leads/components/profile/LeadSchedulesCard";
import { SiteVisitModal } from "@/features/leads/components/modals/SiteVisitModal";

// Hooks
import { useBrokerDetails } from "@/features/brokers/hooks/useBrokerDetails";
import { useBrokerNotes } from "@/features/brokers/hooks/useBrokerNotes";
import { useBrokerSchedules } from "@/features/brokers/hooks/useBrokerSchedules";

export function BrokerProfileClient({ brokerId }: { brokerId: string }) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const pathname = usePathname() || "";
  const isCP = pathname.includes("/channel-partner");
  const isSM = pathname.includes("/sourcing-manager");
  const isCM = pathname.includes("/closing-manager");

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
    handleSubStatusChange,
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
  const mappedBroker = broker
    ? {
        ...broker,
        siteVisits: (broker.meetings || []).map((m: any) => ({
          id: m.id,
          scheduledDate: m.scheduledDate,
          status: m.status,
          meetingNotes: m.meetingNotes,
          project: null,
          destinationUrl: m.destinationUrl,
          arrivedAt: m.arrivedAt,
          arriveLatitude: m.arriveLatitude,
          arriveLongitude: m.arriveLongitude,
          completedAt: m.actualDate,
        })),
      }
    : null;

  const siteVisitData = {
    projectId: "OFFICE_MEETING",
    date: meetingData.scheduledAt,
    description: meetingData.agenda,
  };

  const setSiteVisitData = (data: any) => {
    setMeetingData({
      title: "Meeting",
      scheduledAt: data.date,
      meetingType: "OFFICE",
      agenda: data.description,
    });
  };

  const [isAiAdvancing, setIsAiAdvancing] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<any[]>([
    { id: "OFFICE_MEETING", name: "General Office Meeting" },
  ]);

  useEffect(() => {
    loadBroker().then((brokerData) => {
      updateNotesFromBroker(brokerData);
      updateSchedulesFromBroker(brokerData);
    });
    if (isCP) loadSourcingManagers();

    async function fetchProjects() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const res = await authClient.$fetch("/api/inventory/projects", {
          baseURL: baseUrl,
        });
        if (res.data && Array.isArray(res.data)) {
          setAvailableProjects([
            { id: "OFFICE_MEETING", name: "General Office Meeting" },
            ...(res.data as any[]),
          ]);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    }
    fetchProjects();
  }, [brokerId, isCP]);

  const handleAiAutoAdvance = async () => {
    setIsAiAdvancing(true);
    try {
      if (!userId) {
        toast.error("You must be logged in to auto-advance.");
        setIsAiAdvancing(false);
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(
        `${baseUrl}/api/brokers/${brokerId}/ai-transition-note`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to generate AI auto-advance");
      }

      const brokerData = await loadBroker();
      updateNotesFromBroker(brokerData);
      updateSchedulesFromBroker(brokerData);
      toast.success("AI interaction note and status advanced successfully!");
    } catch (error) {
      console.error(error);
      toast.error(
        "Could not generate AI transition note. Please try again."
      );
    } finally {
      setIsAiAdvancing(false);
    }
  };

  const backHref = isCP
    ? "/dashboard/channel-partner/broker-management"
    : isCM
    ? "/dashboard/closing-manager/broker-management"
    : "/dashboard/sourcing-manager/broker-management";

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-purple-200 border-t-[var(--brand-600)] animate-spin" />
          <span className="text-xs font-semibold text-[var(--text-muted)]">
            Loading broker profile…
          </span>
        </div>
      </div>
    );
  }

  if (!broker) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h2 className="text-base font-bold text-[var(--text-primary)]">
          Broker Profile Not Found
        </h2>
        <Link
          href={backHref}
          className="mt-3 text-xs font-bold text-[var(--brand-700)] hover:underline"
        >
          Return to Broker Network
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-enter">
      {/* Top Bar Navigation */}
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-all active:scale-[0.96] press-effect shadow-2xs"
          title="Back to brokers"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight m-0">
            Broker Profile
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5 m-0">
            Partner identity, deal allocations, call recordings, and schedules
          </p>
        </div>
      </div>

      {/* Broker Executive Header */}
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

      {/* 3-Column Core Workspace */}
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
          setPendingStatusChange={() => {}}
        />

        <LeadSchedulesCard
          siteVisits={mappedBroker?.siteVisits || []}
          followUps={followUps}
          openSiteVisitModal={openMeetingModal}
          openFollowUpModal={openFollowUpModal}
          handleConfirmFollowUp={() => {}}
        />
      </div>

      {/* Deal Cards */}
      <BrokerDealCard
        broker={broker}
        brokerId={brokerId}
        onRefresh={() => loadBroker()}
      />

      {/* Historical Telephony Activity */}
      <CallRecordingsCard lead={mappedBroker} />

      {/* Modals */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setPendingStatusChange(null);
          setNewNoteContent("");
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
        followUpData={{
          title: followUpData.title,
          description: followUpData.notes,
          date: followUpData.scheduledDate,
        }}
        setFollowUpData={(data: any) =>
          setFollowUpData({
            title: data.title,
            type: "CALL",
            notes: data.description,
            scheduledDate: data.date,
          })
        }
        handleSaveFollowUp={() =>
          handleSaveFollowUp(() => {
            loadBroker().then((brokerData) =>
              updateSchedulesFromBroker(brokerData)
            );
          })
        }
        handleDeleteFollowUp={() => {}}
      />

      <SiteVisitModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        editingSiteVisitId={null}
        siteVisitData={siteVisitData}
        setSiteVisitData={setSiteVisitData}
        handleSaveSiteVisit={() =>
          handleSaveMeeting(() => {
            loadBroker().then((brokerData) =>
              updateSchedulesFromBroker(brokerData)
            );
          })
        }
        handleDeleteSiteVisit={() => {}}
        availableProjects={availableProjects}
      />
    </div>
  );
}
