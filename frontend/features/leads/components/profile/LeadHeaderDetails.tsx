import React from 'react';
import { Phone, Mail, MapPin, Clock, Zap, Loader2 } from 'lucide-react';

interface LeadHeaderDetailsProps {
  lead: any;
  isPreSales: boolean;
  isPostSales: boolean;
  displayName: string;
  handleStatusChange: (status: string) => void;
  handleSubStatusChange?: (subStatus: string) => void;
  handleTemperatureChange: (temp: string) => void;
  openFollowUpModal: () => void;
  openSiteVisitModal: () => void;
  handleAiAutoAdvance?: () => void;
  isAiAdvancing?: boolean;
}

/* ── temperature color map ────────────────────────────── */
function tempStyle(temp: string): React.CSSProperties {
  if (temp === 'HOT') return { background: 'var(--danger-bg)', color: 'var(--danger-fg)', border: '1px solid #fca5a5' };
  if (temp === 'WARM') return { background: 'var(--warning-bg)', color: 'var(--warning-fg)', border: '1px solid #fcd34d' };
  if (temp === 'COLD') return { background: 'var(--info-bg)', color: 'var(--info-fg)', border: '1px solid #7dd3fc' };
  return { background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' };
}

export function LeadHeaderDetails({
  lead,
  isPreSales,
  isPostSales,
  displayName,
  handleStatusChange,
  handleSubStatusChange,
  handleTemperatureChange,
  openFollowUpModal,
  openSiteVisitModal,
  handleAiAutoAdvance,
  isAiAdvancing
}: LeadHeaderDetailsProps) {
  const isHot = lead.temperature === 'HOT';

  return (
    <>
      {/* Name + Status + Temp row */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{displayName}</h2>

        {/* Status pill */}
        <select
          value={lead.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          style={{
            padding: '3px 12px',
            background: 'var(--brand-50)',
            color: 'var(--brand-700)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--brand-200)',
            cursor: 'pointer',
            outline: 'none',
            letterSpacing: '0.02em',
            transition: 'background var(--duration-fast)',
          }}
        >
          {(() => {
            const allStatuses = ['NEW', 'CONTACTED', 'INTERESTED', 'QUALIFIED', 'SITE_VISIT_SCHEDULED', 'SITE_VISIT_COMPLETED', 'BOOKING', 'DOCUMENT', 'LOAN', 'AGREEMENT', 'HANDOVER', 'LOST'];
            let availableStatuses = allStatuses;

            if (isPreSales) {
              availableStatuses = allStatuses.filter(s => s !== 'SITE_VISIT_COMPLETED' && s !== 'BOOKING' && !['DOCUMENT', 'LOAN', 'AGREEMENT', 'HANDOVER'].includes(s));
            } else if (isPostSales || (typeof window !== 'undefined' && window.location.pathname.includes('/closing-manager'))) {
              availableStatuses = ['BOOKING', 'DOCUMENT', 'LOAN', 'AGREEMENT', 'HANDOVER'];
            } else {
              availableStatuses = allStatuses.filter(s => !['DOCUMENT', 'LOAN', 'AGREEMENT', 'HANDOVER'].includes(s));
            }

            if (!availableStatuses.includes(lead.status)) {
              availableStatuses = [lead.status, ...availableStatuses];
            }

            return availableStatuses.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ));
          })()}
        </select>

        {/* Temperature pill with animated HOT pulse */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 5 }}>
          {isHot && (
            <span style={{
              position: 'absolute',
              left: 6,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--danger-fg)',
              animation: 'pulse-ring 1.4s ease-out infinite',
              pointerEvents: 'none',
            }} />
          )}
          <select
            value={lead.temperature || ''}
            onChange={(e) => handleTemperatureChange(e.target.value)}
            style={{
              paddingLeft: isHot ? 20 : 12,
              paddingRight: 12,
              paddingTop: 3,
              paddingBottom: 3,
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
              transition: 'background var(--duration-fast)',
              letterSpacing: '0.02em',
              ...tempStyle(lead.temperature || ''),
            }}
          >
            <option value="" disabled>Temp</option>
            {['HOT', 'WARM', 'COLD'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Sub-Status (Post-Sales stages) */}
        {['DOCUMENT', 'LOAN', 'AGREEMENT', 'HANDOVER'].includes(lead.status) && (
          <select
            value={lead.subStatus || ''}
            onChange={(e) => handleSubStatusChange && handleSubStatusChange(e.target.value)}
            style={{
              padding: '3px 12px',
              background: 'var(--bg-subtle)',
              color: 'var(--text-secondary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-default)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="PENDING">Pending</option>
            <option value="DONE">Done</option>
          </select>
        )}

        {/* AI Auto-Advance */}
        {isPreSales && (
          <button
            onClick={handleAiAutoAdvance}
            disabled={isAiAdvancing || lead.status === 'QUALIFIED'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 12px',
              background: '#faf5ff',
              color: '#6d28d9',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              borderRadius: 'var(--radius-full)',
              border: '1px solid #ddd6fe',
              cursor: isAiAdvancing || lead.status === 'QUALIFIED' ? 'not-allowed' : 'pointer',
              opacity: isAiAdvancing || lead.status === 'QUALIFIED' ? 0.5 : 1,
              transition: 'all var(--duration-fast)',
            }}
            title="Automatically determine next status and generate a summary note based on recent calls"
          >
            {isAiAdvancing ? (
              <Loader2 style={{ width: 13, height: 13, animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <Zap style={{ width: 13, height: 13 }} />
            )}
            Auto-Advance
          </button>
        )}
      </div>

      {/* Possession info (Post-Sales) */}
      {isPostSales && (lead.processionStatus || lead.processionTimeline) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
          {lead.processionStatus && (
            <span style={{
              padding: '2px 8px',
              background: 'var(--info-bg)',
              color: 'var(--info-fg)',
              border: '1px solid #bae6fd',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
            }}>
              Status: {lead.processionStatus.replace(/_/g, ' ')}
            </span>
          )}
          {lead.processionTimeline && (
            <span style={{
              padding: '2px 8px',
              background: '#faf5ff',
              color: '#6d28d9',
              border: '1px solid #ddd6fe',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Clock style={{ width: 11, height: 11 }} />
              Possession in {lead.processionTimeline.value} {lead.processionTimeline.unit.toLowerCase()}
            </span>
          )}
        </div>
      )}

      {/* Contact info row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Phone style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {lead.phone}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Mail style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
            {lead.email || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No email</span>}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <MapPin style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
            {lead.preferredLocation || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No location</span>}
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

        {/* Site Visit */}
        {typeof window !== 'undefined' && !window.location.pathname.includes('/post-sales') && !window.location.pathname.includes('/closing-manager') && (
          <button
            onClick={() => openSiteVisitModal()}
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
            <MapPin style={{ width: 14, height: 14 }} />
            Site Visit
          </button>
        )}
      </div>
    </>
  );
}
