import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  StatusPill, SkeletonRows, EmptyState,
  tableHeaderStyle, thStyle, tableWrapperStyle, formatDate,
} from './TablePrimitives';

interface SalesExecTableProps {
  filteredLeads: any[];
  loading: boolean;
  isManagerView?: boolean;
}

export function SalesExecTable({ filteredLeads, loading, isManagerView }: SalesExecTableProps) {
  const pathname = usePathname();
  const colCount = isManagerView ? 8 : 7;

  return (
    <div style={tableWrapperStyle}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
        <thead style={tableHeaderStyle}>
          <tr>
            <th style={{ ...thStyle, width: 48 }}>#</th>
            <th style={thStyle}>Lead</th>
            <th style={thStyle}>Phone</th>
            <th style={thStyle}>Status</th>
            {isManagerView && <th style={thStyle}>Agent</th>}
            <th style={thStyle}>SV Scheduled</th>
            <th style={thStyle}>SV Completed</th>
            {!isManagerView && <th style={thStyle}>Last Contact</th>}
            <th style={thStyle}>Next Follow-Up</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRows cols={colCount} />
          ) : filteredLeads.length === 0 ? (
            <EmptyState message="No leads found. Try adjusting your filters." colSpan={colCount} />
          ) : (
            filteredLeads.map((lead, index) => {
              const href = `${pathname}/${lead.id}`;
              return (
                <tr
                  key={lead.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background var(--duration-fast) var(--ease-out-expo)',
                    cursor: 'pointer',
                  }}
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
                  <td style={{ padding: '14px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', borderLeft: '3px solid transparent', transition: 'border-color var(--duration-fast)' }}>
                    <Link href={href} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>{index + 1}</Link>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                        {lead.firstName} {lead.lastName || ''}
                      </div>
                    </Link>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    <Link href={href} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>{lead.phone}</Link>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
                      <StatusPill status={lead.status} />
                    </Link>
                  </td>
                  {isManagerView && (
                    <td style={{ padding: '14px 16px', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      <Link href={href} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                        {lead.assignedUser ? (lead.assignedUser.name || lead.assignedUser.username) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 400 }}>Unassigned</span>
                        )}
                      </Link>
                    </td>
                  )}
                  <td style={{ padding: '14px 16px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    <Link href={href} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>{formatDate(lead.siteVisitScheduledDate)}</Link>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
                      {lead.siteVisitCompletedDate ? (
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--success-fg)' }}>
                          {formatDate(lead.siteVisitCompletedDate)}
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                    </Link>
                  </td>
                  {!isManagerView && (
                    <td style={{ padding: '14px 16px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      <Link href={href} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>{formatDate(lead.lastContactDate)}</Link>
                    </td>
                  )}
                  <td style={{ padding: '14px 16px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    <Link href={href} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>{formatDate(lead.nextFollowUpDate)}</Link>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
