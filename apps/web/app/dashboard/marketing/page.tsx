"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Settings,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { Button } from "@/components/ui/Button";
import { EmailCampaignListTable } from "@/features/marketing/email/components/EmailCampaignListTable";
import { SmsCampaignListTable } from "@/features/marketing/sms/components/SmsCampaignListTable";
import { MarketingChannelGrid } from "@/features/marketing/components/MarketingChannelGrid";
import {
  UnifiedBroadcastsTable,
  type UnifiedBroadcastItem,
} from "@/features/marketing/components/UnifiedBroadcastsTable";
import type { CampaignItem, SmsCampaignItem } from "@/features/marketing/types";

export default function MarketingHubPage() {
  const [emailCampaigns, setEmailCampaigns] = useState<CampaignItem[]>([]);
  const [smsCampaigns, setSmsCampaigns] = useState<SmsCampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChannelTab, setActiveChannelTab] = useState<"ALL" | "EMAIL" | "SMS">("ALL");

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  useEffect(() => {
    async function loadMarketingData() {
      try {
        setLoading(true);
        setError(null);
        const [emailRes, smsRes] = await Promise.all([
          fetch(`${baseUrl}/api/marketing/campaigns`),
          fetch(`${baseUrl}/api/marketing/sms/campaigns`),
        ]);

        if (emailRes.ok) {
          const emailData = await emailRes.json();
          setEmailCampaigns(emailData?.items || []);
        } else {
          setEmailCampaigns([]);
        }

        if (smsRes.ok) {
          const smsData = await smsRes.json();
          setSmsCampaigns(smsData?.items || []);
        } else {
          setSmsCampaigns([]);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load marketing dashboard");
        setEmailCampaigns([]);
        setSmsCampaigns([]);
      } finally {
        setLoading(false);
      }
    }

    loadMarketingData();
  }, [baseUrl]);

  // Email KPI Calculations
  const emailSent = emailCampaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0);
  const emailDelivered = emailCampaigns.reduce((acc, c) => acc + (c.deliveredCount || 0), 0);
  const emailOpened = emailCampaigns.reduce((acc, c) => acc + (c.openedCount || 0), 0);
  const emailClicked = emailCampaigns.reduce((acc, c) => acc + (c.clickedCount || 0), 0);
  const avgEmailOpenRate = emailDelivered > 0 ? ((emailOpened / emailDelivered) * 100).toFixed(1) : "0.0";

  // SMS KPI Calculations
  const smsSent = smsCampaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0);
  const smsDelivered = smsCampaigns.reduce((acc, c) => acc + (c.deliveredCount || 0), 0);
  const smsClicked = smsCampaigns.reduce((acc, c) => acc + (c.clickedCount || 0), 0);
  const smsSegments = smsCampaigns.reduce((acc, c) => acc + (c.totalSegmentsSent || 0), 0);
  const avgSmsDeliveryRate = smsSent > 0 ? ((smsDelivered / smsSent) * 100).toFixed(1) : "0.0";

  // Combined Click Interactions
  const totalClicks = emailClicked + smsClicked;

  const statItems = [
    {
      label: "Total Emails Sent",
      value: emailSent.toLocaleString(),
      icon: Mail,
      accent: "oklch(0.55 0.22 310)",
      sub: `${emailDelivered.toLocaleString()} delivered · ${avgEmailOpenRate}% open rate`,
    },
    {
      label: "Total SMS Dispatched",
      value: smsSent.toLocaleString(),
      icon: MessageSquare,
      accent: "oklch(0.60 0.19 45)",
      sub: `${smsDelivered.toLocaleString()} delivered (${avgSmsDeliveryRate}%) · ${smsSegments} segments`,
    },
    {
      label: "Email Open Engagement",
      value: `${avgEmailOpenRate}%`,
      icon: Sparkles,
      accent: "oklch(0.48 0.18 240)",
      sub: `${emailOpened.toLocaleString()} total buyer email opens`,
    },
    {
      label: "Total Link Clicks",
      value: totalClicks.toLocaleString(),
      icon: TrendingUp,
      accent: "oklch(0.50 0.17 80)",
      sub: `${emailClicked.toLocaleString()} Email + ${smsClicked.toLocaleString()} SMS clicks`,
    },
  ];

  // Combined and sorted broadcast stream for "ALL" tab
  const unifiedBroadcasts: UnifiedBroadcastItem[] = [
    ...emailCampaigns.map((c) => ({
      id: c.id,
      type: "EMAIL" as const,
      title: c.title,
      previewText: c.subject,
      status: c.status,
      totalRecipients: c.totalRecipients || 0,
      sentCount: c.sentCount || 0,
      deliveredCount: c.deliveredCount || 0,
      openedCount: c.openedCount || 0,
      clickedCount: c.clickedCount || 0,
      createdAt: c.createdAt,
      projectName: c.project?.name,
      providerName: c.providerType,
      detailUrl: `/dashboard/marketing/email/campaigns/${c.id}`,
    })),
    ...smsCampaigns.map((s) => ({
      id: s.id,
      type: "SMS" as const,
      title: s.title,
      previewText: s.messageContent,
      status: s.status,
      totalRecipients: s.totalRecipients || 0,
      sentCount: s.sentCount || 0,
      deliveredCount: s.deliveredCount || 0,
      clickedCount: s.clickedCount || 0,
      createdAt: s.createdAt,
      projectName: s.project?.name,
      providerName: s.providerType,
      detailUrl: `/dashboard/marketing/sms/campaigns/${s.id}`,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      title="Marketing Suite"
      subtitle="Omnichannel marketing hub across Email Broadcasts, WhatsApp Campaigns, SMS, and Portal Integrations."
      headerRight={
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/marketing/email/settings">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <Settings className="w-3.5 h-3.5" />
              <span>Email Integrations</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/sms/settings">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
              <Settings className="w-3.5 h-3.5" />
              <span>SMS Gateways</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/email/campaigns/new">
            <Button variant="default" size="sm" className="gap-2 shadow-sm text-xs font-bold">
              <Mail className="w-3.5 h-3.5" />
              <span>New Email Campaign</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/sms/campaigns/new">
            <Button variant="default" size="sm" className="gap-2 shadow-sm text-xs font-bold bg-amber-600 hover:bg-amber-700">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>New SMS Campaign</span>
            </Button>
          </Link>
        </div>
      }
    >
      {/* ── Top Metric KPI Cards (Email + SMS) ── */}
      <StatCards items={statItems} />

      {/* ── Marketing Channels Matrix ── */}
      <MarketingChannelGrid
        emailCampaigns={emailCampaigns}
        smsCampaigns={smsCampaigns}
      />

      {/* ── Broadcasts Section with Channel Tabs ── */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">
              Marketing Broadcasts Activity
            </h2>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Live multi-channel delivery stream across Email and SMS campaigns.
            </p>
          </div>

          {/* Channel Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 self-start sm:self-auto">
            <button
              onClick={() => setActiveChannelTab("ALL")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 ${
                activeChannelTab === "ALL"
                  ? "bg-white text-[var(--text-primary)] shadow-xs"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span>All Broadcasts</span>
              <span className="text-[10px] font-mono opacity-80">({unifiedBroadcasts.length})</span>
            </button>
            <button
              onClick={() => setActiveChannelTab("EMAIL")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 ${
                activeChannelTab === "EMAIL"
                  ? "bg-white text-purple-700 shadow-xs"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-purple-600" />
              <span>Email ({emailCampaigns.length})</span>
            </button>
            <button
              onClick={() => setActiveChannelTab("SMS")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 ${
                activeChannelTab === "SMS"
                  ? "bg-white text-amber-700 shadow-xs"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>SMS ({smsCampaigns.length})</span>
            </button>
          </div>
        </div>

        {/* Tab View: EMAIL ONLY */}
        {activeChannelTab === "EMAIL" && (
          <EmailCampaignListTable campaigns={emailCampaigns} isLoading={loading} />
        )}

        {/* Tab View: SMS ONLY */}
        {activeChannelTab === "SMS" && (
          <SmsCampaignListTable campaigns={smsCampaigns} isLoading={loading} />
        )}

        {/* Tab View: ALL UNIFIED BROADCASTS */}
        {activeChannelTab === "ALL" && (
          <UnifiedBroadcastsTable broadcasts={unifiedBroadcasts} isLoading={loading} />
        )}
      </div>
    </DashboardPageWrapper>
  );
}
