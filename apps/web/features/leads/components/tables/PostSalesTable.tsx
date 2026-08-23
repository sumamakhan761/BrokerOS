import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle2, Clock } from 'lucide-react';
import {
  StatusPill, SkeletonRows, EmptyState,
  tableHeaderStyle, thStyle, tableWrapperStyle, formatDate,
} from './TablePrimitives';

interface PostSalesTableProps {
  filteredLeads: any[];
  loading: boolean;
}

export function PostSalesTable({ filteredLeads, loading }: PostSalesTableProps) {
  const pathname = usePathname();
  const colCount = 7;

  return (
    <div style={tableWrapperStyle}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
        <thead style={tableHeaderStyle}>
          <tr>
            <th style={{ ...thStyle, width: 48 }}>#</th>
            <th style={thStyle}>Customer</th>
            <th style={thStyle}>Phone</th>
            <th style={thStyle}>Stage</th>
            <th style={thStyle}>Sub-Status</th>
            <th style={thStyle}>Procession</th>
            <th style={thStyle}>Next Follow-Up</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRows cols={colCount} />
          ) : filteredLeads.length === 0 ? (
            <EmptyState message="No leads found in the post-sales pipeline." colSpan={colCount} />
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
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
                      {lead.subStatus === 'DONE' ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 11,
                          fontWeight: 700,
                          background: 'var(--success-bg)',
                          color: 'var(--success-fg)',
                        }}>
                          <CheckCircle2 size={11} /> Done
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 11,
                          fontWeight: 700,
                          background: 'var(--warning-bg)',
                          color: 'var(--warning-fg)',
                        }}>
                          <Clock size={11} /> Pending
                        </span>
                      )}
                    </Link>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
                      {lead.processionStatus ? (
                        <div>
                          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                            {lead.processionStatus.replace(/_/g, ' ')}
                          </div>
                          {lead.processionTimeline && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                              {lead.processionTimeline.value} {lead.processionTimeline.unit} remaining
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 'var(--text-sm)', fontWeight: 400 }}>Not set</span>
                      )}
                    </Link>
                  </td>
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
