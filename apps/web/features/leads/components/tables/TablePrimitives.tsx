import React from 'react';
import Link from 'next/link';

/* ─── Shared helpers ────────────────────────────────────────────── */
export function formatDate(dateString: string | null | undefined) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  NEW:                   { bg: '#eff6ff', fg: '#1d4ed8' },
  CONTACTED:             { bg: '#f0f9ff', fg: '#0369a1' },
  INTERESTED:            { bg: '#ecfdf5', fg: '#15803d' },
  QUALIFIED:             { bg: '#f0fdf4', fg: '#166534' },
  SITE_VISIT_SCHEDULED:  { bg: '#fffbeb', fg: '#b45309' },
  SITE_VISIT_COMPLETED:  { bg: '#faf5ff', fg: '#7c3aed' },
  NEGOTIATION:           { bg: '#fff7ed', fg: '#c2410c' },
  BOOKING:               { bg: '#f0fdf4', fg: '#15803d' },
  DOCUMENT:              { bg: '#fefce8', fg: '#a16207' },
  LOAN:                  { bg: '#eff6ff', fg: '#1d4ed8' },
  AGREEMENT:             { bg: '#fdf4ff', fg: '#9333ea' },
  HANDOVER:              { bg: '#fce7f3', fg: '#be185d' },
  LOST:                  { bg: '#fff1f2', fg: '#be123c' },
};

export function StatusPill({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? { bg: 'var(--bg-subtle)', fg: 'var(--text-secondary)' };
  return (
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
      background: s.bg,
      color: s.fg,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 6, height: 6,
        borderRadius: '50%',
        background: s.fg,
        display: 'inline-block',
        opacity: 0.7,
      }} />
      {status.replace(/_/g, ' ')}
    </span>
  );
}

/* Shimmer skeleton row for loading state */
export function SkeletonRows({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} style={{ padding: '14px 16px' }}>
              <div style={{
                height: 14,
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(90deg, var(--bg-subtle) 0%, var(--bg-muted) 50%, var(--bg-subtle) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s ease infinite',
                width: j === 0 ? '40%' : j === 1 ? '70%' : '55%',
                opacity: 1 - i * 0.12,
              }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* Empty state */
export function EmptyState({ message, colSpan }: { message: string; colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          gap: 12,
        }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.18 }}>
            <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="2.5" />
            <path d="M6 18h36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M16 28h8M16 34h4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--text-muted)',
          }}>{message}</span>
        </div>
      </td>
    </tr>
  );
}

/* Premium table shell */
export const tableHeaderStyle: React.CSSProperties = {
  background: 'var(--bg-subtle)',
  borderBottom: '1px solid var(--border-default)',
};

export const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--text-muted)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};

export const tableWrapperStyle: React.CSSProperties = {
  overflowX: 'auto',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-xl)',
  boxShadow: 'var(--shadow-sm)',
};
