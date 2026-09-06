'use client';

import React from 'react';
import {
  Users,
  Send,
  CheckCheck,
  Eye,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WhatsAppBroadcast } from '@/features/marketing/whatsapp/types';

export interface BroadcastMetricsGridProps {
  broadcast: WhatsAppBroadcast;
}

export function BroadcastMetricsGrid({ broadcast }: BroadcastMetricsGridProps) {
  const total = broadcast.totalRecipients || 1;
  const sentPct = Math.round(((broadcast.sentCount || 0) / total) * 100);
  const delivPct = Math.round(((broadcast.deliveredCount || 0) / (broadcast.sentCount || 1)) * 100);
  const readPct = Math.round(((broadcast.readCount || 0) / (broadcast.deliveredCount || 1)) * 100);
  const repPct = Math.round(((broadcast.repliedCount || 0) / (broadcast.readCount || 1)) * 100);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard
        label="Total Audience"
        value={broadcast.totalRecipients || 0}
        pct={100}
        icon={<Users className="h-4 w-4" />}
        color="bg-slate-500/10 text-slate-600"
      />
      <StatCard
        label="Sent Messages"
        value={broadcast.sentCount || 0}
        pct={sentPct}
        icon={<Send className="h-4 w-4" />}
        color="bg-brand-500/10 text-brand-600"
      />
      <StatCard
        label="Delivered"
        value={broadcast.deliveredCount || 0}
        pct={delivPct}
        icon={<CheckCheck className="h-4 w-4" />}
        color="bg-blue-500/10 text-blue-600"
      />
      <StatCard
        label="Read / Seen"
        value={broadcast.readCount || 0}
        pct={readPct}
        icon={<Eye className="h-4 w-4" />}
        color="bg-purple-500/10 text-purple-600"
      />
      <StatCard
        label="Replied"
        value={broadcast.repliedCount || 0}
        pct={repPct}
        icon={<MessageCircle className="h-4 w-4" />}
        color="bg-emerald-500/10 text-emerald-600"
      />
      <StatCard
        label="Failed / Bounced"
        value={broadcast.failedCount || 0}
        pct={Math.round(((broadcast.failedCount || 0) / total) * 100)}
        icon={<AlertCircle className="h-4 w-4" />}
        color="bg-red-500/10 text-red-600"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  pct,
  icon,
  color,
}: {
  label: string;
  value: number;
  pct: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-3.5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', color)}>
          {icon}
        </div>
        <span className="text-[11px] font-semibold text-text-muted">{pct}%</span>
      </div>
      <p className="mt-2.5 text-xl font-bold text-text-primary">{value.toLocaleString()}</p>
      <p className="text-[11px] text-text-muted">{label}</p>
    </div>
  );
}
