'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { WhatsAppBroadcast } from '@/features/marketing/whatsapp/types';

export interface BroadcastConversionFunnelProps {
  broadcast: WhatsAppBroadcast;
}

export function BroadcastConversionFunnel({ broadcast }: BroadcastConversionFunnelProps) {
  const total = broadcast.totalRecipients || 1;
  const sentPct = Math.round(((broadcast.sentCount || 0) / total) * 100);

  return (
    <div className="rounded-2xl border border-border-default bg-bg-surface p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
          Message Conversion Funnel
        </h3>
        <span className="text-xs font-semibold text-text-muted">
          {broadcast.sentCount || 0} of {broadcast.totalRecipients || 0} sent ({sentPct}%)
        </span>
      </div>
      <div className="space-y-2">
        <FunnelBar label="Sent" count={broadcast.sentCount || 0} max={total} color="bg-brand-600" />
        <FunnelBar label="Delivered" count={broadcast.deliveredCount || 0} max={total} color="bg-blue-600" />
        <FunnelBar label="Read" count={broadcast.readCount || 0} max={total} color="bg-purple-600" />
        <FunnelBar label="Replied" count={broadcast.repliedCount || 0} max={total} color="bg-emerald-600" />
      </div>
    </div>
  );
}

function FunnelBar({
  label,
  count,
  max,
  color,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
}) {
  const pct = Math.max(2, Math.round((count / Math.max(max, 1)) * 100));
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs font-medium text-text-secondary">{label}</span>
      <div className="relative h-6 flex-1 rounded-full bg-bg-subtle overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
        <span className="absolute inset-0 flex items-center px-3 text-[11px] font-bold text-text-primary">
          {count.toLocaleString()} ({pct}%)
        </span>
      </div>
    </div>
  );
}
