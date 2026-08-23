import React, { RefObject } from 'react';
import { Camera } from 'lucide-react';

interface LeadHeaderAvatarProps {
  lead: any;
  leadId: string;
  isEditing: boolean;
  uploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LeadHeaderAvatar({
  lead, leadId, isEditing, uploading, fileInputRef, handleAvatarUpload,
}: LeadHeaderAvatarProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
  const initials = lead.firstName
    ? `${lead.firstName[0]}${lead.lastName?.[0] || ''}`.toUpperCase()
    : '?';

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div
        style={{
          width: 92,
          height: 92,
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          background: lead.avatar ? 'transparent' : 'linear-gradient(135deg, var(--brand-500) 0%, #a855f7 100%)',
          border: '3px solid var(--bg-surface)',
          boxShadow: '0 0 0 2px var(--brand-200), var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          cursor: isEditing ? 'pointer' : 'default',
        }}
        onClick={() => isEditing && fileInputRef.current?.click()}
      >
        {lead.avatar ? (
          <img
            src={`${apiUrl}/api/leads/${leadId}/avatar-image`}
            alt="Avatar"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}>
            {initials}
          </span>
        )}

        {/* Upload overlay on edit */}
        {isEditing && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--radius-xl)',
            backdropFilter: 'blur(2px)',
          }}>
            {uploading ? (
              <div style={{
                width: 22, height: 22,
                border: '2px solid rgba(255,255,255,0.4)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            ) : (
              <Camera size={20} style={{ color: '#fff' }} />
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
