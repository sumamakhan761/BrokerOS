'use client';

import React from 'react';

interface FunnelData {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalReplies: number;
  totalFailed: number;
  deliveredPct: number;
  readPct: number;
  repliedPct: number;
}

interface WhatsAppFunnelMetricsProps {
  funnel?: FunnelData;
  connected?: boolean;
}

export const WhatsAppFunnelMetrics: React.FC<WhatsAppFunnelMetricsProps> = ({
  funnel,
  connected = false,
}) => {
  return (
    <div className="p-6 bg-bg-surface border border-border-default rounded-2xl shadow-2xs space-y-4 flex flex-col justify-between">
      <div>
        <h3 className="font-semibold text-text-primary text-sm">Meta Deliverability Funnel</h3>
        <p className="text-xs text-text-tertiary">Computed from database message receipts</p>
      </div>

      <div className="space-y-3.5">
        <div>
          <div className="flex justify-between text-xs font-medium mb-1">
            <span className="text-text-secondary">Sent to Meta Gateway</span>
            <span className="text-text-primary font-mono font-semibold">
              {funnel?.totalSent ?? 0} msgs (100%)
            </span>
          </div>
          <div className="w-full h-2 bg-bg-subtle rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium mb-1">
            <span className="text-text-secondary">Delivered to Handset</span>
            <span className="text-emerald-500 font-mono font-semibold">
              {funnel?.totalDelivered ?? 0} msgs ({funnel?.deliveredPct ?? 0}%)
            </span>
          </div>
          <div className="w-full h-2 bg-bg-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${funnel?.deliveredPct ?? 0}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium mb-1">
            <span className="text-text-secondary">Read Receipt (Blue Ticks)</span>
            <span className="text-purple-500 font-mono font-semibold">
              {funnel?.totalRead ?? 0} msgs ({funnel?.readPct ?? 0}%)
            </span>
          </div>
          <div className="w-full h-2 bg-bg-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full"
              style={{ width: `${funnel?.readPct ?? 0}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium mb-1">
            <span className="text-text-secondary">Customer Inbound Replies</span>
            <span className="text-amber-500 font-mono font-semibold">
              {funnel?.totalReplies ?? 0} msgs ({funnel?.repliedPct ?? 0}%)
            </span>
          </div>
          <div className="w-full h-2 bg-bg-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${funnel?.repliedPct ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Meta Cloud Status</span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {connected ? 'Connected & Live' : 'Awaiting Setup'}
        </span>
      </div>
    </div>
  );
};
