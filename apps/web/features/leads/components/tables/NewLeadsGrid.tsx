import React from 'react';
import { UserPlus } from 'lucide-react';
import {
  SkeletonRows, EmptyState,
  tableHeaderStyle, thStyle, tableWrapperStyle, formatDate,
} from './TablePrimitives';

interface NewLeadsGridProps {
  leads: any[];
  loading: boolean;
  selectedLeadIds: Set<string>;
  subordinates: any[];
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectOne: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  onAssign: (leadIds: string[], targetUserId?: string, roundRobin?: boolean) => void;
}

export function NewLeadsGrid({
  leads,
  loading,
  selectedLeadIds,
  subordinates,
  onSelectAll,
  onSelectOne,
  onAssign,
}: NewLeadsGridProps) {
  const formatDate = (ds: string) => {
    if (!ds) return '—';
    return new Date(ds).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const colCount = 5;
  const allSelected = leads.length > 0 && selectedLeadIds.size === leads.length;

  return (
    <div style={tableWrapperStyle}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
        <thead style={tableHeaderStyle}>
          <tr>
            <th style={{ ...thStyle, width: 48, textAlign: 'center' }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                style={{
                  width: 16, height: 16, cursor: 'pointer',
                  accentColor: 'var(--brand-600)',
                }}
              />
            </th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Phone</th>
            <th style={thStyle}>Uploaded</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Assign</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRows cols={colCount} />
          ) : leads.length === 0 ? (
            <EmptyState message="No new leads waiting for assignment." colSpan={colCount} />
          ) : (
            leads.map(lead => {
              const isSelected = selectedLeadIds.has(lead.id);
              return (
                <tr
                  key={lead.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: isSelected ? 'var(--brand-50)' : 'transparent',
                    transition: 'background var(--duration-fast) var(--ease-out-expo)',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={e => onSelectOne(e, lead.id)}
                      style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--brand-600)' }}
                    />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                      {lead.firstName} {lead.lastName || ''}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {lead.phone}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {formatDate(lead.createdAt)}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                      <div style={{ position: 'relative' }}>
                        <UserPlus size={12} style={{
                          position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)',
                          color: 'var(--text-muted)', pointerEvents: 'none',
                        }} />
                        <select
                          onChange={e => {
                            if (e.target.value) {
                              onAssign([lead.id], e.target.value);
                              e.target.value = '';
                            }
                          }}
                          style={{
                            height: 32, paddingLeft: 26, paddingRight: 10, appearance: 'none',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
                            outline: 'none', cursor: 'pointer', minWidth: 130,
                          }}
                        >
                          <option value="">Assign to…</option>
                          {subordinates.map(sub => (
                            <option key={sub.id} value={sub.id}>{sub.name || sub.username}</option>
                          ))}
                        </select>
                      </div>
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
