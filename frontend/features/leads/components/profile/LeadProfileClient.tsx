'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { LeadHeader } from '@/features/leads/components/profile/LeadHeader';
import { LeadInformationCard } from '@/features/leads/components/profile/LeadInformationCard';
import { CallRecordingsCard } from '@/features/leads/components/profile/CallRecordingsCard';
import { SiteVisitCompletedCard } from '@/features/leads/components/site-visits/SiteVisitCompletedCard';
import { NegotiationCard } from '@/features/leads/components/negotiations/NegotiationCard';
import { BookingCard } from '@/features/leads/components/booking/BookingCard';
import { NoteModal } from '@/features/leads/components/modals/NoteModal';
import { FollowUpModal } from '@/features/leads/components/modals/FollowUpModal';
import { LeadNotesTimeline } from '@/features/leads/components/profile/LeadNotesTimeline';
import { LeadSchedulesCard } from '@/features/leads/components/profile/LeadSchedulesCard';
import { SiteVisitModal } from '@/features/leads/components/modals/SiteVisitModal';
import { SiteVisitCompleteModal } from '@/features/leads/components/modals/SiteVisitCompleteModal';
import { PostSalesPipelineCards } from '@/features/leads/components/post-sales/PostSalesPipelineCards';
import { PaymentHistoryCard } from '@/components/leads/PaymentHistoryCard';
import { toast } from 'sonner';

// Hooks
import { useLeadDetails } from '@/features/leads/hooks/useLeadDetails';
import { useLeadNotes } from '@/features/leads/hooks/useLeadNotes';
import { useLeadSchedules } from '@/features/leads/hooks/useLeadSchedules';
import { useLeadBooking } from '@/features/leads/hooks/useLeadBooking';
import { useLeadNegotiations } from '@/features/leads/hooks/useLeadNegotiations';

export function LeadProfileClient({ leadId }: { leadId: string }) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const pathname = usePathname();

  let inferredRole = (session?.user as any)?.role || '';
  if (!inferredRole) {
    if (pathname.includes('/closing-manager')) inferredRole = 'CLOSING_MANAGER';
    else if (pathname.includes('/channel-partner')) inferredRole = 'CHANNEL_PARTNER';
    else if (pathname.includes('/sales-executive')) inferredRole = 'SALES_EXECUTIVE';
    else if (pathname.includes('/post-sales')) inferredRole = 'POST_SALES';
  }

  const {
    lead,
    setLead,
    loading,
    isEditing,
    setIsEditing,
    uploading,
    fileInputRef,
    isEditingLeadInfo,
    setIsEditingLeadInfo,
    availableSources,
    availableProjects,
    formData,
    setFormData,
    leadInfoData,
    setLeadInfoData,
    fetchLead,
    fetchMetadata,
    handleSave,
    handleLeadInfoSave,
    handleTemperatureChange,
    handleSubStatusChange,
    handleAvatarUpload
  } = useLeadDetails(leadId);

  const {
    notes,
    isNoteModalOpen,
    setIsNoteModalOpen,
    newNoteContent,
    setNewNoteContent,
    pendingStatusChange,
    setPendingStatusChange,
    isSavingNote,
    fetchNotes,
    handleStatusChange,
    saveNote,
  } = useLeadNotes(leadId, userId, lead, setLead);

  const {
    followUps,
    siteVisits,
    isFollowUpModalOpen,
    setIsFollowUpModalOpen,
    isSiteVisitModalOpen,
    setIsSiteVisitModalOpen,
    svCompleteModalOpen,
    setSvCompleteModalOpen,
    editingFollowUpId,
    editingSiteVisitId,
    selectedSvId,
    setSelectedSvId,
    followUpData,
    setFollowUpData,
    siteVisitData,
    setSiteVisitData,
    isSavingFollowUp,
    isSavingSiteVisit,
    fetchFollowUps,
    fetchSiteVisits,
    handleSaveFollowUp,
    handleDeleteFollowUp,
    openFollowUpModal,
    handleConfirmFollowUp,
    handleSaveSiteVisit,
    handleDeleteSiteVisit,
    openSiteVisitModal,
  } = useLeadSchedules(leadId, userId, lead);

  const {
    booking,
    fetchBooking,
  } = useLeadBooking(leadId);

  const {
    negotiations,
    fetchNegotiations,
  } = useLeadNegotiations(leadId);

  const [isAiAdvancing, setIsAiAdvancing] = React.useState(false);

  const handleAiAutoAdvance = async () => {
    setIsAiAdvancing(true);
    try {
      if (!userId) {
        toast.error('You must be logged in to auto-advance.');
        setIsAiAdvancing(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/leads/${leadId}/ai-transition-note`, {
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
      await fetchNotes();
    } catch (error) {
      console.error(error);
      toast.error('Could not generate AI transition note. Please try again.');
    } finally {
      setIsAiAdvancing(false);
    }
  };

  useEffect(() => {
    fetchLead();
    fetchNotes();
    fetchMetadata();
    fetchFollowUps();
    fetchSiteVisits();
    fetchBooking();
    fetchNegotiations();
  }, [leadId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500 animate-pulse">Loading profile...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Lead not found</h2>
        <p className="text-gray-500 mt-2">The lead you are looking for does not exist or was removed.</p>
        <Link href="/dashboard/lead-management" className="mt-4 text-blue-600 hover:underline">
          Return to Leads
        </Link>
      </div>
    );
  }

  const isSalesExec = typeof window !== 'undefined' && window.location.pathname.includes('/sales-executive');
  const isSalesManager = typeof window !== 'undefined' && window.location.pathname.includes('/sales-manager');
  const isPostSales = typeof window !== 'undefined' && window.location.pathname.includes('/post-sales');
  const isClosingManager = typeof window !== 'undefined' && window.location.pathname.includes('/closing-manager');
  const isChannelPartner = typeof window !== 'undefined' && window.location.pathname.includes('/channel-partner');

  const backHref = isSalesExec
    ? "/dashboard/sales-executive/lead-management"
    : isSalesManager
      ? "/dashboard/sales-manager/lead-management"
      : isPostSales
        ? "/dashboard/post-sales/lead-management"
        : isClosingManager
          ? "/dashboard/closing-manager/lead-management"
          : isChannelPartner
            ? "/dashboard/channel-partner/customer-management"
            : "/dashboard/pre-sales/lead-management";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={backHref}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Lead Profile</h1>
      </div>

      <LeadHeader
        lead={lead}
        leadId={leadId}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        formData={formData}
        setFormData={setFormData}
        handleSave={handleSave}
        uploading={uploading}
        fileInputRef={fileInputRef}
        handleAvatarUpload={handleAvatarUpload}
        handleStatusChange={handleStatusChange}
        handleSubStatusChange={handleSubStatusChange}
        handleTemperatureChange={handleTemperatureChange}
        openFollowUpModal={openFollowUpModal}
        openSiteVisitModal={openSiteVisitModal}
        handleAiAutoAdvance={handleAiAutoAdvance}
        isAiAdvancing={isAiAdvancing}
      />

      {lead.aiNextStepSuggestion && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 shadow-sm flex items-start gap-3">
          <div className="bg-purple-100 p-2 rounded-full mt-0.5">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-purple-900 mb-1">AI Next Step Suggestion</h4>
            <p className="text-sm text-purple-800 leading-relaxed">
              {lead.aiNextStepSuggestion}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LeadInformationCard
          lead={lead}
          isEditingLeadInfo={isEditingLeadInfo}
          setIsEditingLeadInfo={setIsEditingLeadInfo}
          leadInfoData={leadInfoData}
          setLeadInfoData={setLeadInfoData}
          handleLeadInfoSave={handleLeadInfoSave}
          availableSources={availableSources}
          availableProjects={availableProjects}
        />
        <LeadNotesTimeline
          notes={notes}
          setPendingStatusChange={setPendingStatusChange}
          setIsNoteModalOpen={setIsNoteModalOpen}
        />
        {/* Show schedule card for everyone, but hide site visits for closing manager/channel partner */}
        <LeadSchedulesCard
          siteVisits={siteVisits}
          openSiteVisitModal={openSiteVisitModal}
          followUps={followUps}
          openFollowUpModal={openFollowUpModal}
          handleConfirmFollowUp={handleConfirmFollowUp}
          onMarkCompleted={(svId) => {
            setSelectedSvId(svId);
            setSvCompleteModalOpen(true);
          }}
          hideSiteVisits={isClosingManager || isChannelPartner}
        />
      </div>

      {(isSalesExec || isSalesManager) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SiteVisitCompletedCard
            siteVisits={siteVisits.filter(sv => sv.status === 'COMPLETED' || sv.completedAt)}
            leadId={leadId}
            onRefresh={fetchSiteVisits}
          />
          <NegotiationCard
            negotiations={negotiations}
            leadId={leadId}
            userId={userId || ''}
            onRefresh={fetchNegotiations}
          />
          <BookingCard
            booking={booking}
            leadId={leadId}
            userId={userId || ''}
            onRefresh={fetchBooking}
          />
        </div>
      )}

      {(isPostSales || isClosingManager || isChannelPartner) && booking && (
        <>
          <PaymentHistoryCard
            bookingId={booking.id}
            agreedPrice={booking.agreedPrice || 0}
            bookingAmount={booking.bookingAmount || 0}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BookingCard
              booking={booking}
              leadId={leadId}
              userId={userId || ''}
              onRefresh={fetchBooking}
              lead={lead}
              userRole={inferredRole}
            />
            <PostSalesPipelineCards
              leadId={leadId}
              leadStatus={lead.status}
              leadSubStatus={lead.subStatus}
              booking={booking}
              userRole={inferredRole}
              onRefresh={() => {
                fetchLead();
                fetchBooking();
              }}
            />
          </div>
        </>
      )}
      {(isPostSales || isClosingManager || isChannelPartner) && !booking && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BookingCard
            booking={booking}
            leadId={leadId}
            userId={userId || ''}
            onRefresh={fetchBooking}
            lead={lead}
            userRole={inferredRole}
          />
        </div>
      )}

      <CallRecordingsCard lead={lead} />

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setPendingStatusChange(null);
          setNewNoteContent('');
        }}
        pendingStatusChange={pendingStatusChange}
        newNoteContent={newNoteContent}
        setNewNoteContent={setNewNoteContent}
        saveNote={saveNote}
        isSavingNote={isSavingNote}
      />

      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        editingFollowUpId={editingFollowUpId}
        followUpData={followUpData}
        setFollowUpData={setFollowUpData}
        handleSaveFollowUp={handleSaveFollowUp}
        handleDeleteFollowUp={handleDeleteFollowUp}
        isSaving={isSavingFollowUp}
      />

      <SiteVisitModal
        isOpen={isSiteVisitModalOpen}
        onClose={() => setIsSiteVisitModalOpen(false)}
        editingSiteVisitId={editingSiteVisitId}
        siteVisitData={siteVisitData}
        setSiteVisitData={setSiteVisitData}
        handleSaveSiteVisit={handleSaveSiteVisit}
        handleDeleteSiteVisit={handleDeleteSiteVisit}
        availableProjects={availableProjects}
        isSaving={isSavingSiteVisit}
      />

      <SiteVisitCompleteModal
        isOpen={svCompleteModalOpen}
        onClose={() => { setSvCompleteModalOpen(false); setSelectedSvId(null); }}
        siteVisit={siteVisits.find(sv => sv.id === selectedSvId) || selectedSvId!}
        onRefresh={fetchSiteVisits}
      />
    </div>
  );
}