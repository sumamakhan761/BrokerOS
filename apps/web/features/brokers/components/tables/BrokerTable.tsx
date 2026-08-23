import React from 'react';
import Link from 'next/link';
import { Phone, MapPin, UserCheck, ExternalLink, MoreVertical } from 'lucide-react';
import {
  SkeletonRows, EmptyState,
  tableHeaderStyle, thStyle, tableWrapperStyle,
} from '@/features/leads/components/tables/TablePrimitives';

const BROKER_STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  NEW:       { bg: '#eff6ff', fg: '#1d4ed8' },
  CONTACTED: { bg: '#f0f9ff', fg: '#0369a1' },
  VISIT:     { bg: '#fffbeb', fg: '#b45309' },
  DEAL:      { bg: '#f0fdf4', fg: '#15803d' },
  ACTIVE:    { bg: '#ecfdf5', fg: '#15803d' },
  INACTIVE:  { bg: '#fff1f2', fg: '#be123c' },
};

interface BrokerTableProps {
  loading: boolean;
  filteredBrokers: any[];
  isCP: boolean;
  setAssignModalBroker: (broker: any) => void;
}

export function BrokerTable({ loading, filteredBrokers, isCP, setAssignModalBroker }: BrokerTableProps) {
  const colCount = isCP ? 7 : 6;

  return (
    <div style={tableWrapperStyle}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 840 }}>
        <thead style={tableHeaderStyle}>
          <tr>
            <th style={{ ...thStyle, width: 48 }}>#</th>
            <th style={thStyle}>Broker</th>
            <th style={thStyle}>Contact</th>
            <th style={thStyle}>Location</th>
            <th style={thStyle}>Status</th>
            {isCP && <th style={thStyle}>Sourcing Manager</th>}
            <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRows cols={colCount} />
          ) : filteredBrokers.length === 0 ? (
            <EmptyState message="No brokers found. Try adjusting your filters." colSpan={colCount} />
          ) : (
            filteredBrokers.map((broker, index) => {
              const brokerLink = isCP
                ? `/dashboard/channel-partner/broker-management/${broker.id}`
                : `/dashboard/sourcing-manager/broker-management/${broker.id}`;
              const statusKey = broker.status as string;
              const statusColor = BROKER_STATUS_COLORS[statusKey] ?? { bg: 'var(--bg-subtle)', fg: 'var(--text-secondary)' };

              return (
                <tr
                  key={broker.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background var(--duration-fast) var(--ease-out-expo)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)';
                    const firstTd = (e.currentTarget as HTMLElement).querySelector('td') as HTMLElement;
                    if (firstTd) firstTd.style.borderLeft = '3px solid var(--brand-500)';
                    // Show action buttons
                    const actions = (e.currentTarget as HTMLElement).querySelector('[data-actions]') as HTMLElement;
                    if (actions) actions.style.opacity = '1';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    const firstTd = (e.currentTarget as HTMLElement).querySelector('td') as HTMLElement;
                    if (firstTd) firstTd.style.borderLeft = '3px solid transparent';
                    const actions = (e.currentTarget as HTMLElement).querySelector('[data-actions]') as HTMLElement;
                    if (actions) actions.style.opacity = '0';
                  }}
                >
                  <td style={{ padding: '14px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', borderLeft: '3px solid transparent', transition: 'border-color var(--duration-fast)' }}>
                    <Link href={brokerLink} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>{index + 1}</Link>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={brokerLink} style={{ display: 'block', textDecoration: 'none' }}>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                        {broker.companyName || 'N/A'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>
                        {broker.name}
                      </div>
                    </Link>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={brokerLink} style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      <Phone size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> {broker.phone}
                    </Link>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={brokerLink} style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      <MapPin size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> {broker.city || 'N/A'}
                    </Link>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={brokerLink} style={{ display: 'block', textDecoration: 'none' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                        background: statusColor.bg,
                        color: statusColor.fg,
                      }}>
                        {broker.status}
                        {broker.subStatus && (
                          <span style={{ opacity: 0.7, fontWeight: 500 }}>· {broker.subStatus}</span>
                        )}
                      </span>
                    </Link>
                  </td>
                  {isCP && (
                    <td style={{ padding: '14px 16px', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      <Link href={brokerLink} style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: 'inherit' }}>
                        {broker.sourcingManager ? (
                          <>
                            <UserCheck size={13} style={{ color: 'var(--success-fg)', flexShrink: 0 }} />
                            {broker.sourcingManager.name}
                          </>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 400 }}>Unassigned</span>
                        )}
                      </Link>
                    </td>
                  )}
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div
                      data-actions=""
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: 8,
                        opacity: 0,
                        transition: 'opacity var(--duration-fast) var(--ease-out-expo)',
                      }}
                    >
                      <Link
                        href={brokerLink}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'var(--brand-600)',
                          textDecoration: 'none',
                          padding: '5px 10px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--brand-50)',
                          transition: 'background var(--duration-fast)',
                        }}
                      >
                        <ExternalLink size={12} /> View
                      </Link>
                      {isCP && (
                        <button
                          onClick={() => setAssignModalBroker(broker)}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--bg-subtle)',
                            border: '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            transition: 'background var(--duration-fast)',
                          }}
                          title="More actions"
                        >
                          <MoreVertical size={14} style={{ color: 'var(--text-secondary)' }} />
                        </button>
                      )}
                    </div>
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
