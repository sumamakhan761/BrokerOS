import React, { RefObject } from 'react';
import { Card } from '@/components/ui/Card';
import { Edit2, Check, X } from 'lucide-react';
import { LeadHeaderAvatar } from '@/features/leads/components/profile/LeadHeaderAvatar';
import { LeadHeaderDetails } from '@/features/leads/components/profile/LeadHeaderDetails';
import { LeadHeaderEdit } from '@/features/leads/components/profile/LeadHeaderEdit';

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
  isAiAdvancing
}: LeadHeaderProps) {
  const displayName = lead.firstName ? `${lead.firstName} ${lead.lastName || ''}`.trim() : 'Unknown Name';
  const displayScore = lead.score !== null ? lead.score : '-';
  const isPreSales = typeof window !== 'undefined' && window.location.pathname.includes('/pre-sales');
  const isPostSales = typeof window !== 'undefined' && window.location.pathname.includes('/post-sales');

  return (
    <Card className="p-6 relative">
      {/* Edit Toggle */}
      <div className="absolute top-6 right-6 z-10">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 bg-gray-50 rounded-full shadow-sm border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-all cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  firstName: lead.firstName || '',
                  lastName: lead.lastName || '',
                  email: lead.email || '',
                  preferredLocation: lead.preferredLocation || '',
                });
              }}
              className="p-2 bg-gray-50 rounded-full shadow-sm border border-gray-200 text-gray-600 hover:text-red-600 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              className="p-2 bg-blue-600 rounded-full shadow-sm border border-blue-700 text-white hover:bg-blue-700 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Avatar */}
        <LeadHeaderAvatar
          lead={lead}
          leadId={leadId}
          isEditing={isEditing}
          uploading={uploading}
          fileInputRef={fileInputRef}
          handleAvatarUpload={handleAvatarUpload}
        />

        {/* Details */}
        <div className="flex-1 space-y-4 w-full">
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

        {/* Score Circle on far right */}
        {!isEditing && (
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* SVG for circular border resembling progress */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="42" stroke="#f3f4f6" strokeWidth="6" fill="transparent" />
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke={lead.score >= 80 ? '#10b981' : lead.score >= 60 ? '#eab308' : '#ef4444'}
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * (lead.score || 0)) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="flex flex-col items-center justify-center z-10 text-gray-900 mt-1">
                <span className="text-2xl font-bold leading-none">{displayScore}</span>
                <span className="text-[10px] font-bold tracking-widest text-gray-500 mt-1 uppercase">Score</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
