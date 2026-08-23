import React from 'react';
import { Edit2, Check, X, Briefcase, Globe, User, UserCheck, IndianRupee, Building2, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { LeadInformationDisplay } from '@/features/leads/components/profile/LeadInformationDisplay';
import { LeadInformationEdit } from '@/features/leads/components/profile/LeadInformationEdit';

interface LeadInformationCardProps {
  lead: any;
  isEditingLeadInfo: boolean;
  setIsEditingLeadInfo: (val: boolean) => void;
  leadInfoData: any;
  setLeadInfoData: (data: any) => void;
  handleLeadInfoSave: () => void;
  availableSources: any[];
  availableProjects: any[];
}

export function LeadInformationCard({
  lead,
  isEditingLeadInfo,
  setIsEditingLeadInfo,
  leadInfoData,
  setLeadInfoData,
  handleLeadInfoSave,
  availableSources,
  availableProjects,
}: LeadInformationCardProps) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-sm)',
      padding: 24,
      animation: 'enter 350ms var(--ease-out-expo) both',
      animationDelay: '80ms',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 24,
      }}>
        <h3 style={{
          margin: 0,
          fontSize: 'var(--text-base)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Briefcase size={17} style={{ color: 'var(--brand-600)' }} />
          Lead Information
        </h3>

        <div style={{ display: 'flex', gap: 6 }}>
          {!isEditingLeadInfo ? (
            <button
              onClick={() => setIsEditingLeadInfo(true)}
              title="Edit"
              style={{
                width: 30, height: 30, borderRadius: 'var(--radius-full)',
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
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
              }}
            >
              <Edit2 size={13} />
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditingLeadInfo(false);
                  setLeadInfoData({
                    budget: lead.budget || '',
                    lastContactDate: lead.lastContactDate ? new Date(lead.lastContactDate).toISOString().split('T')[0] : '',
                    nextFollowUpDate: lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toISOString().split('T')[0] : '',
                    sourceId: lead.sourceId || '',
                    interestedProjectId: lead.interestedProjectId || '',
                    preferredLocation: lead.preferredLocation || '',
                    requirements: lead.requirements || '',
                  });
                }}
                style={{
                  width: 30, height: 30, borderRadius: 'var(--radius-full)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--danger-bg)', border: '1px solid #fca5a5',
                  color: 'var(--danger-fg)', cursor: 'pointer',
                }}
              >
                <X size={13} />
              </button>
              <button
                onClick={handleLeadInfoSave}
                style={{
                  width: 30, height: 30, borderRadius: 'var(--radius-full)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--success-bg)', border: '1px solid #86efac',
                  color: 'var(--success-fg)', cursor: 'pointer',
                }}
              >
                <Check size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {!isEditingLeadInfo ? (
        <LeadInformationDisplay lead={lead} />
      ) : (
        <LeadInformationEdit
          leadInfoData={leadInfoData}
          setLeadInfoData={setLeadInfoData}
          availableSources={availableSources}
          availableProjects={availableProjects}
        />
      )}
    </div>
  );
}
