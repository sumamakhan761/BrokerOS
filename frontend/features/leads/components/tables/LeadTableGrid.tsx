import React from 'react';
import Link from 'next/link';
import {
  StatusPill, SkeletonRows, EmptyState,
  tableHeaderStyle, thStyle, tableWrapperStyle, formatDate,
} from './TablePrimitives';

interface LeadTableGridProps {
  leads: any[];
  loading: boolean;
  isManagerView?: boolean;
  pathname: string;
}

const TEMP_COLORS: Record<string, { bg: string; fg: string }> = {
  HOT:  { bg: '#fff1f2', fg: '#e11d48' },
  WARM: { bg: '#fff7ed', fg: '#ea580c' },
  COLD: { bg: '#eff6ff', fg: '#3b82f6' },
};

export function LeadTableGrid({ leads, loading, isManagerView, pathname }: LeadTableGridProps) {
  const colCount = isManagerView ? 8 : 9;

  return (
    <div style={tableWrapperStyle}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 840 }}>
        <thead style={tableHeaderStyle}>
          <tr>
            <th style={{ ...thStyle, width: 48 }}>#</th>
            <th style={thStyle}>Lead</th>
            <th style={thStyle}>Phone</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Temp</th>
            <th style={thStyle}>{isManagerView ? 'Agent' : 'Assigned To'}</th>
            {!isManagerView && <th style={thStyle}>Score</th>}
            <th style={thStyle}>Last Contact</th>
            <th style={thStyle}>Follow Up</th>
            <th style={thStyle}>Site Visit</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRows cols={colCount} />
          ) : leads.length === 0 ? (
            <EmptyState message="No leads found. Try adjusting your filters." colSpan={colCount} />
          ) : (
            leads.map((lead, index) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                index={index}
                pathname={pathname}
                isManagerView={isManagerView}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function LeadRow({ lead, index, pathname, isManagerView }: {
  lead: any;
  index: number;
  pathname: string;
  isManagerView?: boolean;
}) {
  const href = `${pathname}/${lead.id}`;
  const temp = lead.temperature as string;
  const tempColor = TEMP_COLORS[temp] ?? null;

  return (
    <tr
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background var(--duration-fast) var(--ease-out-expo)',
        cursor: 'pointer',
      }}
      className="table-row-hover"
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)';
        const firstTd = (e.currentTarget as HTMLElement).querySelector('td') as HTMLElement;
        if (firstTd) firstTd.style.borderLeft = '3px solid var(--brand-500)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
        const firstTd = (e.currentTarget as HTMLElement).querySelector('td') as HTMLElement;
        if (firstTd) firstTd.style.borderLeft = '3px solid transparent';
      }}
    >
      <td style={{ padding: '14px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', borderLeft: '3px solid transparent', transition: 'border-color var(--duration-fast) var(--ease-out-expo)' }}>
        <Link href={href} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>{index + 1}</Link>
      </td>
      <td style={{ padding: '14px 16px' }}>
        <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {lead.firstName} {lead.lastName || ''}
          </div>
        </Link>
      </td>
      <td style={{ padding: '14px 16px' }}>
        <Link href={href} style={{ display: 'block', textDecoration: 'none', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {lead.phone}
        </Link>
      </td>
      <td style={{ padding: '14px 16px' }}>
        <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
          <StatusPill status={lead.status} />
        </Link>
      </td>
      <td style={{ padding: '14px 16px' }}>
        <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
          {tempColor ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              fontSize: 10,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              background: tempColor.bg,
              color: tempColor.fg,
            }}>
              {temp === 'HOT' && '🔥'} {temp}
            </span>
          ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
        </Link>
      </td>
      <td style={{ padding: '14px 16px', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>
        <Link href={href} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
          {lead.assignedUser ? (lead.assignedUser.name || lead.assignedUser.username) : (
            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 400 }}>Unassigned</span>
          )}
        </Link>
      </td>
      {!isManagerView && (
        <td style={{ padding: '14px 16px' }}>
          <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
            {lead.score !== null && lead.score !== undefined ? (
              <span style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: 11,
                fontWeight: 800,
                background: lead.score >= 80 ? '#f0fdf4' : lead.score >= 60 ? '#fffbeb' : '#fff1f2',
                color: lead.score >= 80 ? '#15803d' : lead.score >= 60 ? '#b45309' : '#be123c',
              }}>
                {lead.score}
              </span>
            ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
          </Link>
        </td>
      )}
      <td style={{ padding: '14px 16px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
        <Link href={href} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>{formatDate(lead.lastContactDate)}</Link>
      </td>
      <td style={{ padding: '14px 16px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
        <Link href={href} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>{formatDate(lead.nextFollowUpDate)}</Link>
      </td>
      <td style={{ padding: '14px 16px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
        <Link href={href} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
          {lead.latestSiteVisit ? formatDate(lead.latestSiteVisit.scheduledDate) : '—'}
        </Link>
      </td>
    </tr>
  );
}
