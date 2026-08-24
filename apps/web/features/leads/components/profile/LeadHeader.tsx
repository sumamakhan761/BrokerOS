import React, { RefObject } from "react";
import { Card } from "@/components/ui/Card";
import { Edit2, Check, X } from "lucide-react";
import { LeadHeaderAvatar } from "@/features/leads/components/profile/LeadHeaderAvatar";
import { LeadHeaderDetails } from "@/features/leads/components/profile/LeadHeaderDetails";
import { LeadHeaderEdit } from "@/features/leads/components/profile/LeadHeaderEdit";

interface LeadHeaderProps {
  lead: any;
  leadId: string;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  formData: any;
  setFormData: (data: any) => void;
  handleSave: () => void;
  uploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStatusChange: (status: string) => void;
  handleSubStatusChange?: (subStatus: string) => void;
  handleTemperatureChange: (temp: string) => void;
  openFollowUpModal: () => void;
  openSiteVisitModal: () => void;
  handleAiAutoAdvance?: () => void;
  isAiAdvancing?: boolean;
}

export function LeadHeader({
  lead,
  leadId,
  isEditing,
  setIsEditing,
  formData,
  setFormData,
  handleSave,
  uploading,
  fileInputRef,
  handleAvatarUpload,
  handleStatusChange,
  handleSubStatusChange,
  handleTemperatureChange,
  openFollowUpModal,
  openSiteVisitModal,
  handleAiAutoAdvance,
  isAiAdvancing,
}: LeadHeaderProps) {
  const displayName = lead.firstName
    ? `${lead.firstName} ${lead.lastName || ""}`.trim()
    : "Unknown Name";
  const displayScore = lead.score !== null && lead.score !== undefined ? lead.score : "—";
  const isPreSales =
    typeof window !== "undefined" &&
    window.location.pathname.includes("/pre-sales");
  const isPostSales =
    typeof window !== "undefined" &&
    window.location.pathname.includes("/post-sales");

  const scoreCirc = 2 * Math.PI * 40;
  const scorePct = lead.score ? Math.min(100, Math.max(0, lead.score)) : 0;
  const scoreOffset = scoreCirc - (scorePct / 100) * scoreCirc;

  return (
    <Card className="p-6 relative rounded-2xl border border-slate-200/80 shadow-xs">
      {/* Quick Edit Toggle Button */}
      <div className="absolute top-5 right-5 z-10">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-[var(--brand-700)] flex items-center justify-center transition-all active:scale-[0.96] press-effect cursor-pointer"
            title="Edit contact info"
          >
            <Edit2 size={13} />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  firstName: lead.firstName || "",
                  lastName: lead.lastName || "",
                  email: lead.email || "",
                  preferredLocation: lead.preferredLocation || "",
                });
              }}
              className="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center transition-all active:scale-[0.96] press-effect cursor-pointer"
              title="Cancel edits"
            >
              <X size={14} />
            </button>
            <button
              onClick={handleSave}
              className="w-8 h-8 rounded-full bg-[var(--brand-600)] hover:bg-[var(--brand-700)] border border-[var(--brand-700)] text-white flex items-center justify-center transition-all active:scale-[0.96] press-effect shadow-xs cursor-pointer"
              title="Save changes"
            >
              <Check size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar */}
        <LeadHeaderAvatar
          lead={lead}
          leadId={leadId}
          isEditing={isEditing}
          uploading={uploading}
          fileInputRef={fileInputRef}
          handleAvatarUpload={handleAvatarUpload}
        />

        {/* Lead Details & Action Controls */}
        <div className="flex-1 space-y-4 w-full min-w-0">
          {!isEditing ? (
            <LeadHeaderDetails
              lead={lead}
              isPreSales={isPreSales}
              isPostSales={isPostSales}
              displayName={displayName}
              handleStatusChange={handleStatusChange}
              handleSubStatusChange={handleSubStatusChange}
              handleTemperatureChange={handleTemperatureChange}
              openFollowUpModal={openFollowUpModal}
              openSiteVisitModal={openSiteVisitModal}
              handleAiAutoAdvance={handleAiAutoAdvance}
              isAiAdvancing={isAiAdvancing}
            />
          ) : (
            <LeadHeaderEdit
              formData={formData}
              setFormData={setFormData}
              leadPhone={lead.phone}
            />
          )}
        </div>

        {/* AI Score Radial Gauge on Far Right */}
        {!isEditing && (
          <div className="shrink-0 flex flex-col items-center justify-center pr-2">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg width={80} height={80} className="-rotate-90">
                <circle
                  cx={40}
                  cy={40}
                  r={35}
                  stroke="#f1f5f9"
                  strokeWidth={5}
                  fill="transparent"
                />
                <circle
                  cx={40}
                  cy={40}
                  r={35}
                  stroke={
                    lead.score >= 80
                      ? "#10b981"
                      : lead.score >= 60
                      ? "#f59e0b"
                      : "#f43f5e"
                  }
                  strokeWidth={5}
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 35}
                  strokeDashoffset={
                    2 * Math.PI * 35 -
                    (2 * Math.PI * 35 * (lead.score || 0)) / 100
                  }
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-[var(--text-primary)] tabular-nums leading-none">
                  {displayScore}
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--text-muted)] mt-0.5">
                  Score
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
