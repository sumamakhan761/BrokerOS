"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { LeadHeader } from "@/features/leads/components/profile/LeadHeader";
import { LeadInformationCard } from "@/features/leads/components/profile/LeadInformationCard";
import { CallRecordingsCard } from "@/features/leads/components/profile/CallRecordingsCard";
import { SiteVisitCompletedCard } from "@/features/leads/components/site-visits/SiteVisitCompletedCard";
import { NegotiationCard } from "@/features/leads/components/negotiations/NegotiationCard";
import { BookingCard } from "@/features/leads/components/booking/BookingCard";
import { NoteModal } from "@/features/leads/components/modals/NoteModal";
import { FollowUpModal } from "@/features/leads/components/modals/FollowUpModal";
import { LeadNotesTimeline } from "@/features/leads/components/profile/LeadNotesTimeline";
import { LeadSchedulesCard } from "@/features/leads/components/profile/LeadSchedulesCard";
import { SiteVisitModal } from "@/features/leads/components/modals/SiteVisitModal";
import { SiteVisitCompleteModal } from "@/features/leads/components/modals/SiteVisitCompleteModal";
import { PostSalesPipelineCards } from "@/features/leads/components/post-sales/PostSalesPipelineCards";
import { PaymentHistoryCard } from "@/components/leads/PaymentHistoryCard";
import { toast } from "sonner";

// Hooks
import { useLeadDetails } from "@/features/leads/hooks/useLeadDetails";
import { useLeadNotes } from "@/features/leads/hooks/useLeadNotes";
import { useLeadSchedules } from "@/features/leads/hooks/useLeadSchedules";
import { useLeadBooking } from "@/features/leads/hooks/useLeadBooking";
import { useLeadNegotiations } from "@/features/leads/hooks/useLeadNegotiations";

export function LeadProfileClient({ leadId }: { leadId: string }) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const pathname = usePathname();

  let inferredRole = (session?.user as any)?.role || "";
  if (!inferredRole) {
    if (pathname.includes("/closing-manager")) inferredRole = "CLOSING_MANAGER";
    else if (pathname.includes("/channel-partner")) inferredRole = "CHANNEL_PARTNER";
    else if (pathname.includes("/sales-executive")) inferredRole = "SALES_EXECUTIVE";
    else if (pathname.includes("/post-sales")) inferredRole = "POST_SALES";
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
    handleAvatarUpload,
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

  const { booking, fetchBooking } = useLeadBooking(leadId);
  const { negotiations, fetchNegotiations } = useLeadNegotiations(leadId);

  const [isAiAdvancing, setIsAiAdvancing] = useState(false);

  const handleAiAutoAdvance = async () => {
    setIsAiAdvancing(true);
    try {
      if (!userId) {
        toast.error("You must be logged in to auto-advance.");
        setIsAiAdvancing(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(`${apiUrl}/api/leads/${leadId}/ai-transition-note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate AI auto-advance");
      }

      toast.success("AI transition note and status generated!");
      await fetchLead();
      await fetchNotes();
    } catch (error) {
      console.error(error);
      toast.error("Could not generate AI transition note. Please try again.");
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
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3.5">
        <div className="w-9 h-9 rounded-full border-2 border-purple-100 border-t-[var(--brand-600)] animate-spin" />
        <p className="text-xs font-semibold text-[var(--text-tertiary)]">
          Loading prospect profile & activity feed…
        </p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 max-w-lg mx-auto text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 mx-auto">
          <AlertCircle size={22} />
        </div>
        <h2 className="text-base font-extrabold text-[var(--text-primary)]">
          Prospect Record Not Found
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          The requested lead profile does not exist or you do not have permission to view it.
        </p>
        <Link
          href="/dashboard/pre-sales/lead-management"
          className="inline-flex items-center text-xs font-bold text-[var(--brand-700)] bg-purple-50 hover:bg-purple-100 border border-purple-200 px-4 py-2 rounded-xl transition-all"
        >
          Return to Leads
        </Link>
      </div>
    );
  }

  const isSalesExec = typeof window !== "undefined" && window.location.pathname.includes("/sales-executive");
  const isSalesManager = typeof window !== "undefined" && window.location.pathname.includes("/sales-manager");
  const isPostSales = typeof window !== "undefined" && window.location.pathname.includes("/post-sales");
  const isClosingManager = typeof window !== "undefined" && window.location.pathname.includes("/closing-manager");
  const isChannelPartner = typeof window !== "undefined" && window.location.pathname.includes("/channel-partner");

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
    <div className="max-w-7xl mx-auto space-y-6 animate-enter">
      {/* Top Breadcrumb / Back Bar */}
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-[var(--brand-700)] hover:border-purple-200 shadow-xs transition-all active:scale-[0.96] press-effect"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Prospect Profile
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)] leading-none m-0">
            {lead.firstName} {lead.lastName || ""}
          </h1>
        </div>
      </div>

      {/* Main Executive Lead Header Card */}
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

      {/* AI Next Step Banner */}
      {lead.aiNextStepSuggestion && (
        <div className="bg-gradient-to-r from-purple-50/90 to-indigo-50/90 border border-purple-200/90 rounded-2xl p-4 shadow-xs flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100/90 flex items-center justify-center text-purple-700 flex-shrink-0 mt-0.5">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-purple-950 mb-0.5 tracking-tight">
              AI Copilot Next Step Suggestion
            </h4>
            <p className="text-xs font-medium text-purple-800 leading-relaxed m-0">
              {lead.aiNextStepSuggestion}
            </p>
          </div>
        </div>
      )}

      {/* 3-Column Core Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

      {/* Sales Exec / Manager Extensions: Site Visits, Negotiations, Bookings */}
      {(isSalesExec || isSalesManager) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SiteVisitCompletedCard
            siteVisits={siteVisits.filter(
              (sv) => sv.status === "COMPLETED" || sv.completedAt
            )}
            leadId={leadId}
            onRefresh={fetchSiteVisits}
          />
          <NegotiationCard
            negotiations={negotiations}
            leadId={leadId}
            userId={userId || ""}
            onRefresh={fetchNegotiations}
          />
          <BookingCard
            booking={booking}
            leadId={leadId}
            userId={userId || ""}
            onRefresh={fetchBooking}
          />
        </div>
      )}

      {/* Post Sales / CP / Closing Manager: Payments & Pipeline Handovers */}
      {(isPostSales || isClosingManager || isChannelPartner) && booking && (
        <>
          <PaymentHistoryCard
            bookingId={booking.id}
            agreedPrice={booking.agreedPrice || 0}
            bookingAmount={booking.bookingAmount || 0}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BookingCard
              booking={booking}
              leadId={leadId}
              userId={userId || ""}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BookingCard
            booking={booking}
            leadId={leadId}
            userId={userId || ""}
            onRefresh={fetchBooking}
            lead={lead}
            userRole={inferredRole}
          />
        </div>
      )}

      {/* Call Recordings Player Card */}
      <CallRecordingsCard lead={lead} />

      {/* Action Modals */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setPendingStatusChange(null);
          setNewNoteContent("");
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
        onClose={() => {
          setSvCompleteModalOpen(false);
          setSelectedSvId(null);
        }}
        siteVisit={
          siteVisits.find((sv) => sv.id === selectedSvId) || selectedSvId!
        }
        onRefresh={fetchSiteVisits}
      />
    </div>
  );
}