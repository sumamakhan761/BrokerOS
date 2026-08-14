import React, { RefObject } from 'react';
import { Card } from '@/components/ui/Card';
import { Edit2, Check, X } from 'lucide-react';
import { BrokerHeaderAvatar } from '@/features/brokers/components/profile/BrokerHeaderAvatar';
import { BrokerHeaderDetails } from '@/features/brokers/components/profile/BrokerHeaderDetails';
import { BrokerHeaderEdit } from '@/features/brokers/components/profile/BrokerHeaderEdit';

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
  isAiAdvancing
}: BrokerHeaderProps) {
  const displayName = broker.name || 'Unknown Broker';

  return (
    <Card className="p-6 relative">
      {/* Edit Toggle */}
      <div className="absolute top-6 right-6 z-10">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              width: 32, height: 32, borderRadius: 'var(--radius-full)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all var(--duration-fast)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--brand-50)';
              (e.currentTarget as HTMLElement).style.color = 'var(--brand-600)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand-300)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
            }}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: broker.name || '',
                  email: broker.email || '',
                });
              }}
              style={{
                width: 32, height: 32, borderRadius: 'var(--radius-full)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--danger-bg)',
                border: '1px solid #fca5a5',
                color: 'var(--danger-fg)',
                cursor: 'pointer',
                transition: 'all var(--duration-fast)',
              }}
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              style={{
                width: 32, height: 32, borderRadius: 'var(--radius-full)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--brand-600)',
                border: '1px solid var(--brand-700)',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all var(--duration-fast)',
              }}
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Avatar */}
        <BrokerHeaderAvatar broker={broker} />

        {/* Details */}
        <div className="flex-1 space-y-4 w-full">
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
