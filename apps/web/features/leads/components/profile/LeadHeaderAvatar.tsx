import React, { RefObject } from "react";
import { Camera, Loader2 } from "lucide-react";

interface LeadHeaderAvatarProps {
  lead: any;
  leadId: string;
  isEditing: boolean;
  uploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LeadHeaderAvatar({
  lead,
  leadId,
  isEditing,
  uploading,
  fileInputRef,
  handleAvatarUpload,
}: LeadHeaderAvatarProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
  const initials = lead.firstName
    ? `${lead.firstName[0]}${lead.lastName?.[0] || ""}`.toUpperCase()
    : "??";

  return (
    <div className="relative shrink-0">
      <div
        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex items-center justify-center relative transition-all ${
          lead.avatar
            ? "bg-slate-100"
            : "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20"
        } outline outline-1 -outline-offset-1 outline-black/10 ${
          isEditing ? "cursor-pointer ring-2 ring-purple-400" : ""
        }`}
        onClick={() => isEditing && fileInputRef.current?.click()}
      >
        {lead.avatar ? (
          <img
            src={`${apiUrl}/api/leads/${leadId}/avatar-image`}
            alt={lead.firstName || "Lead"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight select-none">
            {initials}
          </span>
        )}

        {/* Upload Overlay on Edit Mode */}
        {isEditing && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center rounded-2xl transition-opacity">
            {uploading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Camera className="w-5 h-5 text-white" />
            )}
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleAvatarUpload}
      />
    </div>
  );
}
