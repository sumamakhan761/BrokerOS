'use client';

import React from 'react';
import Link from 'next/link';
import { Send } from 'lucide-react';

interface RecentBroadcast {
  id: string;
  name: string;
  templateName: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  createdAt: string;
}

interface WhatsAppRecentBroadcastsTableProps {
  recentBroadcasts: RecentBroadcast[];
}

export const WhatsAppRecentBroadcastsTable: React.FC<WhatsAppRecentBroadcastsTableProps> = ({
  recentBroadcasts = [],
}) => {
  return (
    <div className="p-6 bg-bg-surface border border-border-default rounded-2xl shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-brand-500" />
          <h3 className="font-semibold text-text-primary text-sm">Recent Broadcasts</h3>
        </div>
        <Link
          href="/dashboard/marketing/whatsapp/broadcasts"
          className="text-xs text-brand-600 hover:text-brand-700 font-medium"
        >
          View all &rarr;
        </Link>
      </div>

      {recentBroadcasts.length === 0 ? (
        <div className="text-center py-8 text-xs text-text-tertiary border border-dashed border-border-default rounded-xl">
          No broadcast campaigns launched yet. Click &quot;New Broadcast&quot; to get started.
        </div>
      ) : (
        <div className="divide-y divide-border-default/60">
          {recentBroadcasts.map((b) => (
            <Link
              key={b.id}
              href={`/dashboard/marketing/whatsapp/broadcasts/${b.id}`}
              className="py-3 flex items-center justify-between hover:bg-bg-subtle/50 px-2 rounded-xl transition-colors group"
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-text-primary truncate">
                    {b.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-bg-subtle text-text-secondary border border-border-default">
                    {b.status}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted font-mono mt-0.5">
                  Template: {b.templateName}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-semibold text-text-primary block">
                  {b.deliveredCount} / {b.totalRecipients}
                </span>
                <span className="text-[10px] text-text-muted">delivered</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
