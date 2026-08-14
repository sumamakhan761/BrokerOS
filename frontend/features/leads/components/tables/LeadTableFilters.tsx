import React from 'react';
import { Search, SlidersHorizontal, X, Calendar } from 'lucide-react';

const STATUS_GROUPS: { label: string; value: string; color: string }[] = [
  { label: 'All',           value: '',                    color: 'var(--text-secondary)' },
  { label: 'New',           value: 'NEW',                 color: '#1d4ed8' },
  { label: 'Contacted',     value: 'CONTACTED',           color: '#0369a1' },
  { label: 'Interested',    value: 'INTERESTED',          color: '#15803d' },
  { label: 'SV Scheduled',  value: 'SITE_VISIT_SCHEDULED',color: '#b45309' },
  { label: 'SV Done',       value: 'SITE_VISIT_COMPLETED',color: '#7c3aed' },
  { label: 'Negotiation',   value: 'NEGOTIATION',         color: '#c2410c' },
  { label: 'Booking',       value: 'BOOKING',             color: '#15803d' },
  { label: 'Lost',          value: 'LOST',                color: '#be123c' },
];

interface LeadTableFiltersProps {
  isManagerView?: boolean;
  status: string;
  setStatus: (val: string) => void;
  scoreRange: string;
  setScoreRange: (val: string) => void;
  followUpDate: string;
  setFollowUpDate: (val: string) => void;
  siteVisitDate: string;
  setSiteVisitDate: (val: string) => void;
  search?: string;
  setSearch?: (val: string) => void;
}

export function LeadTableFilters({
  isManagerView,
  status,
  setStatus,
  scoreRange,
  setScoreRange,
  followUpDate,
  setFollowUpDate,
  siteVisitDate,
  setSiteVisitDate,
  search = '',
  setSearch,
}: LeadTableFiltersProps) {
  const hasActive = status || scoreRange || followUpDate || siteVisitDate || search;

  const clearAll = () => {
    setStatus('');
    setScoreRange('');
    setFollowUpDate('');
    setSiteVisitDate('');
    setSearch?.('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
      {/* Search + date row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        {setSearch !== undefined && (
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search size={14} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or phone…"
              style={{
                width: '100%',
                height: 38,
                paddingLeft: 34,
                paddingRight: 12,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color var(--duration-fast)',
              }}
              onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--brand-400)'; }}
              onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-default)'; }}
            />
          </div>
        )}

        {/* Follow-up date */}
        <div style={{ position: 'relative', flex: '0 1 180px' }}>
          <Calendar size={13} style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            type="date"
            value={followUpDate}
            onChange={e => setFollowUpDate(e.target.value)}
            title="Filter by Follow-up Date"
            style={{
              width: '100%',
              height: 38,
              paddingLeft: 30,
              paddingRight: 8,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: followUpDate ? 'var(--text-primary)' : 'var(--text-muted)',
              outline: 'none',
              cursor: 'pointer',
            }}
          />
          {followUpDate && (
            <span style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              fontSize: 10, fontWeight: 700, color: 'var(--brand-600)',
              background: 'var(--brand-50)',
              padding: '2px 5px', borderRadius: 4,
            }}>F-UP</span>
          )}
        </div>

        {/* Site visit date */}
        <div style={{ position: 'relative', flex: '0 1 180px' }}>
          <Calendar size={13} style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            type="date"
            value={siteVisitDate}
            onChange={e => setSiteVisitDate(e.target.value)}
            title="Filter by Site Visit Date"
            style={{
              width: '100%',
              height: 38,
              paddingLeft: 30,
              paddingRight: 8,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: siteVisitDate ? 'var(--text-primary)' : 'var(--text-muted)',
              outline: 'none',
              cursor: 'pointer',
            }}
          />
          {siteVisitDate && (
            <span style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              fontSize: 10, fontWeight: 700, color: '#7c3aed',
              background: '#f5f3ff',
              padding: '2px 5px', borderRadius: 4,
            }}>SV</span>
          )}
        </div>

        {/* Score range — only for non-manager */}
        {!isManagerView && (
          <div style={{ position: 'relative', flex: '0 1 160px' }}>
            <SlidersHorizontal size={13} style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }} />
            <select
              value={scoreRange}
              onChange={e => setScoreRange(e.target.value)}
              style={{
                width: '100%',
                height: 38,
                paddingLeft: 30,
                paddingRight: 8,
                appearance: 'none',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: scoreRange ? 'var(--text-primary)' : 'var(--text-muted)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">All Scores</option>
              <option value="0-60">Low (0–60)</option>
              <option value="60-80">Medium (60–80)</option>
              <option value="80-100">High (80–100)</option>
            </select>
          </div>
        )}

        {/* Clear all */}
        {hasActive && (
          <button
            onClick={clearAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              height: 38,
              padding: '0 14px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--danger-bg)',
              border: '1px solid #fecaca',
              color: 'var(--danger-fg)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background var(--duration-fast)',
              flexShrink: 0,
            }}
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Status pill pills row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {STATUS_GROUPS.map(opt => {
          const active = status === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              style={{
                padding: '5px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: 12,
                fontWeight: active ? 800 : 600,
                cursor: 'pointer',
                border: active ? `1.5px solid ${opt.color}` : '1.5px solid var(--border-default)',
                background: active ? opt.color : 'var(--bg-surface)',
                color: active ? '#fff' : 'var(--text-secondary)',
                transition: 'all var(--duration-fast) var(--ease-out-expo)',
                whiteSpace: 'nowrap',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
