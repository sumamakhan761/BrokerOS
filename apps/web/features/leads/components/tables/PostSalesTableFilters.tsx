import React from 'react';
import { Search, Calendar, X } from 'lucide-react';

const POST_SALES_STATUS_OPTIONS = [
  { label: 'All',       value: 'BOOKING,DOCUMENT,LOAN,AGREEMENT,HANDOVER', color: 'var(--text-secondary)' },
  { label: 'Booking',   value: 'BOOKING',   color: '#15803d' },
  { label: 'Document',  value: 'DOCUMENT',  color: '#a16207' },
  { label: 'Loan',      value: 'LOAN',      color: '#1d4ed8' },
  { label: 'Agreement', value: 'AGREEMENT', color: '#9333ea' },
  { label: 'Handover',  value: 'HANDOVER',  color: '#be185d' },
];

interface PostSalesTableFiltersProps {
  status: string;
  setStatus: (v: string) => void;
  followUpDate: string;
  setFollowUpDate: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  completedHandoversOnly?: boolean;
}

export function PostSalesTableFilters({
  status, setStatus,
  followUpDate, setFollowUpDate,
  search, setSearch,
  completedHandoversOnly,
}: PostSalesTableFiltersProps) {
  const hasActive = status !== 'BOOKING,DOCUMENT,LOAN,AGREEMENT,HANDOVER' && status !== '' || followUpDate || search;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
      {/* Row 1: search + date */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customer name or phone…"
            style={{
              width: '100%', height: 38, paddingLeft: 34, paddingRight: 12,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', outline: 'none',
              transition: 'border-color var(--duration-fast)',
            }}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--brand-400)'; }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-default)'; }}
          />
        </div>

        {/* Follow-up date */}
        <div style={{ position: 'relative', flex: '0 1 180px' }}>
          <Calendar size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} title="Follow-Up Date"
            style={{ width: '100%', height: 38, paddingLeft: 30, paddingRight: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', fontWeight: 500, color: followUpDate ? 'var(--text-primary)' : 'var(--text-muted)', outline: 'none', cursor: 'pointer' }} />
        </div>

        {hasActive && (
          <button onClick={() => { setStatus('BOOKING,DOCUMENT,LOAN,AGREEMENT,HANDOVER'); setFollowUpDate(''); setSearch(''); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 38, padding: '0 14px', borderRadius: 'var(--radius-lg)', background: 'var(--danger-bg)', border: '1px solid #fecaca', color: 'var(--danger-fg)', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Row 2: status pills — only if not completedHandoversOnly */}
      {!completedHandoversOnly && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {POST_SALES_STATUS_OPTIONS.map(opt => {
            const active = status === opt.value;
            return (
              <button key={opt.value} onClick={() => setStatus(opt.value)} style={{
                padding: '5px 14px', borderRadius: 'var(--radius-full)', fontSize: 12,
                fontWeight: active ? 800 : 600, cursor: 'pointer',
                border: active ? `1.5px solid ${opt.color}` : '1.5px solid var(--border-default)',
                background: active ? opt.color : 'var(--bg-surface)',
                color: active ? '#fff' : 'var(--text-secondary)',
                transition: 'all var(--duration-fast) var(--ease-out-expo)',
                whiteSpace: 'nowrap',
              }}>
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
