import React from 'react';
import { Phone, Mail, MapPin, Clock, Users, Wand2, Loader2 } from 'lucide-react';

interface BrokerHeaderDetailsProps {
  broker: any;
  displayName: string;
  handleStatusChange: (status: string) => void;
  handleSubStatusChange?: (subStatus: string) => void;
  openFollowUpModal: () => void;
  openMeetingModal: () => void;
  handleAiAutoAdvance: () => void;
  isAiAdvancing: boolean;
}

/* dynamic status pill color */
function statusPillStyle(status: string): React.CSSProperties {
  if (status === 'ACTIVE') return { background: 'var(--success-bg)', color: 'var(--success-fg)', border: '1px solid #86efac' };
  if (status === 'BLACKLISTED') return { background: 'var(--danger-bg)', color: 'var(--danger-fg)', border: '1px solid #fca5a5' };
  if (status === 'INACTIVE') return { background: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' };
  if (status === 'DEAL') return { background: 'var(--info-bg)', color: 'var(--info-fg)', border: '1px solid #7dd3fc' };
  /* default — brand tint */
  return { background: 'var(--brand-50)', color: 'var(--brand-700)', border: '1px solid var(--brand-200)' };
}

export function BrokerHeaderDetails({
  broker,
  displayName,
  handleStatusChange,
  handleSubStatusChange,
  openFollowUpModal,
  openMeetingModal,
  handleAiAutoAdvance,
  isAiAdvancing
}: BrokerHeaderDetailsProps) {
  return (
    <>
      {/* Name + Status row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        <h2 style={{
          margin: 0,
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}>
          {displayName}
        </h2>

        {/* Status pill */}
        <select
          value={broker.status || 'NEW'}
          onChange={(e) => handleStatusChange(e.target.value)}
          style={{
            padding: '3px 12px',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            outline: 'none',
            letterSpacing: '0.02em',
            transition: 'background var(--duration-fast)',
            ...statusPillStyle(broker.status || 'NEW'),
          }}
        >
          {(() => {
            const allStatuses = ['PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'BLACKLISTED', 'NEW', 'CONTACTED', 'VISIT', 'DEAL'];
            let availableStatuses = allStatuses;
            if (!availableStatuses.includes(broker.status)) {
              availableStatuses = [broker.status, ...availableStatuses].filter(Boolean);
            }
            return availableStatuses.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ));
          })()}
        </select>

        {/* Sub-Status pill */}
        <select
          value={broker.subStatus || 'PENDING'}
          onChange={(e) => handleSubStatusChange && handleSubStatusChange(e.target.value)}
          style={{
            padding: '3px 12px',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-subtle)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-default)',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="PENDING">Pending</option>
          <option value="DONE">Done</option>
        </select>

        {/* AI Auto-Advance */}
        <button
          onClick={handleAiAutoAdvance}
          disabled={isAiAdvancing}
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 14px',
            background: 'linear-gradient(135deg, #c026d3, var(--brand-600))',
            color: '#fff',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            borderRadius: 'var(--radius-full)',
            border: 'none',
            cursor: isAiAdvancing ? 'not-allowed' : 'pointer',
            opacity: isAiAdvancing ? 0.6 : 1,
            boxShadow: 'var(--shadow-sm)',
            transition: 'all var(--duration-base) var(--ease-out-expo)',
          }}
          onMouseEnter={e => {
            if (!isAiAdvancing) {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-brand)';
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
          }}
          title="Auto-advance status based on AI call analysis"
        >
          {isAiAdvancing
            ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 0.8s linear infinite' }} />
            : <Wand2 style={{ width: 13, height: 13 }} />
          }
          {isAiAdvancing ? 'Analyzing…' : 'AI Auto-Advance'}
        </button>
      </div>

      {/* Contact info */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Phone style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {broker.phone}{broker.alternatePhone ? ` / ${broker.alternatePhone}` : ''}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Mail style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
            {broker.email || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No email</span>}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <MapPin style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
            {broker.city || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No location</span>}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, paddingTop: 2 }}>
        {/* Call */}
        <button
          style={{
            padding: '7px 16px',
            background: 'var(--success-bg)',
            color: 'var(--success-fg)',
            border: '1px solid #86efac',
            borderRadius: 'var(--radius-lg)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            display: 'flex', alignItems: 'center', gap: 7,
            cursor: 'pointer',
            transition: 'all var(--duration-base) var(--ease-out-expo)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <Phone style={{ width: 14, height: 14 }} />
          Call
        </button>

        {/* WhatsApp */}
        <button
          style={{
            padding: '7px 16px',
            background: '#f0fdf4',
            color: '#15803d',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-lg)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            display: 'flex', alignItems: 'center', gap: 7,
            cursor: 'pointer',
            transition: 'all var(--duration-base) var(--ease-out-expo)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <svg style={{ width: 14, height: 14, fill: 'currentColor' }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
          WhatsApp
        </button>

        {/* Follow-up */}
        <button
          onClick={() => openFollowUpModal()}
          style={{
            padding: '7px 16px',
            background: 'var(--brand-600)',
            color: '#fff',
            border: '1px solid var(--brand-700)',
            borderRadius: 'var(--radius-lg)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            display: 'flex', alignItems: 'center', gap: 7,
            cursor: 'pointer',
            transition: 'all var(--duration-base) var(--ease-out-expo)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--brand-700)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-brand)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--brand-600)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <Clock style={{ width: 14, height: 14 }} />
          Follow-up
        </button>

        {/* Meeting */}
        <button
          onClick={() => openMeetingModal()}
          style={{
            padding: '7px 16px',
            background: 'var(--brand-50)',
            color: 'var(--brand-700)',
            border: '1px solid var(--brand-200)',
            borderRadius: 'var(--radius-lg)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            display: 'flex', alignItems: 'center', gap: 7,
            cursor: 'pointer',
            transition: 'all var(--duration-base) var(--ease-out-expo)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--brand-100)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--brand-50)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <Users style={{ width: 14, height: 14 }} />
          Meeting
        </button>
      </div>
    </>
  );
}
