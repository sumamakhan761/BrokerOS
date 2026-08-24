import React from "react";
import { Card } from "@/components/ui/Card";
import { Edit2, Check, X } from "lucide-react";
import { BrokerHeaderAvatar } from "@/features/brokers/components/profile/BrokerHeaderAvatar";
import { BrokerHeaderDetails } from "@/features/brokers/components/profile/BrokerHeaderDetails";
import { BrokerHeaderEdit } from "@/features/brokers/components/profile/BrokerHeaderEdit";

interface BrokerHeaderProps {
  broker: any;
  brokerId: string;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  formData: any;
  setFormData: (data: any) => void;
  handleSave: () => void;
  handleStatusChange: (status: string) => void;
  handleSubStatusChange?: (subStatus: string) => void;
  openFollowUpModal: () => void;
  openMeetingModal: () => void;
  handleAiAutoAdvance: () => void;
  isAiAdvancing: boolean;
  isCM?: boolean;
}

export function BrokerHeader({
  broker,
  brokerId,
  isEditing,
  setIsEditing,
  formData,
  setFormData,
  handleSave,
  handleStatusChange,
  handleSubStatusChange,
  openFollowUpModal,
  openMeetingModal,
  handleAiAutoAdvance,
  isAiAdvancing,
  isCM,
}: BrokerHeaderProps) {
  const displayName = broker.name || "Unknown Broker";

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
                  name: broker.name || "",
                  email: broker.email || "",
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
        <BrokerHeaderAvatar broker={broker} />

        {/* Details & Action Controls */}
        <div className="flex-1 space-y-4 w-full min-w-0">
          {!isEditing ? (
            <BrokerHeaderDetails
              broker={broker}
              displayName={displayName}
              handleStatusChange={handleStatusChange}
              handleSubStatusChange={handleSubStatusChange}
              openFollowUpModal={openFollowUpModal}
              openMeetingModal={openMeetingModal}
              handleAiAutoAdvance={handleAiAutoAdvance}
              isAiAdvancing={isAiAdvancing}
              isCM={isCM}
            />
          ) : (
            <BrokerHeaderEdit
              formData={formData}
              setFormData={setFormData}
              brokerPhone={broker.phone}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
