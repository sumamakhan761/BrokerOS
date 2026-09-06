'use client';

// ============================================================================
// BrokerOS — WhatsApp Marketing Hub Overview Page (100% Real Live CRM Data)
// ============================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Send } from 'lucide-react';
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper';
import { WhatsAppKpiCards } from '@/features/marketing/whatsapp/components/overview/WhatsAppKpiCards';
import { WhatsAppTrafficChart } from '@/features/marketing/whatsapp/components/overview/WhatsAppTrafficChart';
import { WhatsAppFunnelMetrics } from '@/features/marketing/whatsapp/components/overview/WhatsAppFunnelMetrics';
import { WhatsAppRecentChatsTable } from '@/features/marketing/whatsapp/components/overview/WhatsAppRecentChatsTable';
import { WhatsAppRecentBroadcastsTable } from '@/features/marketing/whatsapp/components/overview/WhatsAppRecentBroadcastsTable';
import { WhatsAppHubNavGrid } from '@/features/marketing/whatsapp/components/overview/WhatsAppHubNavGrid';

interface OverviewData {
  connected: boolean;
  activeConversations: number;
  totalUnread: number;
  totalBroadcasts: number;
  totalContacts: number;
  aiActive: boolean;
  aiProvider: string | null;
  reliability: number;
  traffic7Days: Array<{ day: string; date: string; outbound: number; inbound: number }>;
  funnel: {
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    totalReplies: number;
    totalFailed: number;
    deliveredPct: number;
    readPct: number;
    repliedPct: number;
  };
  recentConversations: Array<{
    id: string;
    contactName: string;
    contactPhone: string;
    status: string;
    lastMessageText: string | null;
    lastMessageAt: string | null;
    unreadCount: number;
  }>;
  recentBroadcasts: Array<{
    id: string;
    name: string;
    templateName: string;
    status: string;
    totalRecipients: number;
    sentCount: number;
    deliveredCount: number;
    readCount: number;
    createdAt: string;
  }>;
}

export default function WhatsAppHubPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${baseUrl}/api/marketing/whatsapp/overview`);
        if (!res.ok) {
          throw new Error('Failed to fetch WhatsApp CRM overview metrics');
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err?.message || 'Failed to load WhatsApp data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [baseUrl]);

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      title="WhatsApp CRM & Broadcasts"
      subtitle="Omnichannel customer messaging, official Meta HSM broadcasts, AI sales concierge, and visual automations."
      headerRight={
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/marketing/whatsapp/inbox"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open WhatsApp Inbox</span>
          </Link>
          <Link
            href="/dashboard/marketing/whatsapp/broadcasts/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-2xs"
          >
            <Send className="w-4 h-4" />
            <span>New Broadcast</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Real KPI Cards */}
        <WhatsAppKpiCards data={data} />

        {/* Real 7-Day Traffic Timeline & SLA Deliverability Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <WhatsAppTrafficChart traffic7Days={data?.traffic7Days || []} />
          <WhatsAppFunnelMetrics funnel={data?.funnel} connected={data?.connected} />
        </div>

        {/* Recent Conversations & Recent Broadcasts Real Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WhatsAppRecentChatsTable recentConversations={data?.recentConversations || []} />
          <WhatsAppRecentBroadcastsTable recentBroadcasts={data?.recentBroadcasts || []} />
        </div>

        {/* Feature Hub Grid Navigation */}
        <WhatsAppHubNavGrid />
      </div>
    </DashboardPageWrapper>
  );
}
