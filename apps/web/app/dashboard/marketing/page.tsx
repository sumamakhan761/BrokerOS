"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  Radio,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Settings,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Users,
  CheckCircle2,
  Plus,
  Layers,
  MousePointer,
  ExternalLink,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CampaignListTable } from "@/features/marketing/components/CampaignListTable";
import { SmsCampaignListTable } from "@/features/marketing/components/SmsCampaignListTable";
import { CAMPAIGN_STATUS_CONFIG } from "@brokeros/constants";
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
      accent: "oklch(0.55 0.22 310)", // Purple
      sub: `${emailDelivered.toLocaleString()} delivered · ${avgEmailOpenRate}% open rate`,
    },
    {
      label: "Total SMS Dispatched",
      value: smsSent.toLocaleString(),
      icon: MessageSquare,
      accent: "oklch(0.60 0.19 45)", // Amber / Orange
      sub: `${smsDelivered.toLocaleString()} delivered (${avgSmsDeliveryRate}%) · ${smsSegments} segments`,
    },
    {
      label: "Email Open Engagement",
      value: `${avgEmailOpenRate}%`,
      icon: Sparkles,
      accent: "oklch(0.48 0.18 240)", // Royal Blue
      sub: `${emailOpened.toLocaleString()} total buyer email opens`,
    },
    {
      label: "Total Link Clicks",
      value: totalClicks.toLocaleString(),
      icon: TrendingUp,
      accent: "oklch(0.50 0.17 80)", // Gold
      sub: `${emailClicked.toLocaleString()} Email + ${smsClicked.toLocaleString()} SMS clicks`,
    },
  ];

  // Combined and sorted broadcast stream for "ALL" tab
  type UnifiedBroadcastItem = {
    id: string;
    type: "EMAIL" | "SMS";
    title: string;
    previewText: string;
    status: string;
    totalRecipients: number;
    sentCount: number;
    deliveredCount: number;
    openedCount?: number;
    clickedCount: number;
    createdAt: string;
    projectName?: string;
    providerName?: string;
    detailUrl: string;
  };

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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">
              Marketing Channels
            </h2>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Manage your outreach strategies and configure connected provider engines.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Email Marketing Channel Card */}
          <Link
            href="/dashboard/marketing/email"
            className="group relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-purple-300 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Mail className="w-5 h-5" strokeWidth={2.2} />
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="success" className="text-[10px] font-bold">
                    Active Engine
                  </Badge>
                  <span className="text-[11px] font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                    {emailCampaigns.length} Active
                  </span>
                </div>
              </div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-purple-600 transition-colors">
                Email Marketing
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">
                Broadcast project launches, price drops, and commission alerts with AWS SES, SendGrid, Brevo & Mailchimp.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
              <span>Open Email Engine</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* SMS Channel Card */}
          <Link
            href="/dashboard/marketing/sms"
            className="group relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <MessageSquare className="w-5 h-5" strokeWidth={2.2} />
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="success" className="text-[10px] font-bold">
                    Active Gateway
                  </Badge>
                  <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                    {smsCampaigns.length} Active
                  </span>
                </div>
              </div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-amber-600 transition-colors">
                SMS Broadcasts
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">
                Fast promotional & transactional SMS routing via Twilio, AWS SNS, Sinch & Gupshup with DLT headers.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
              <span>Open SMS Engine</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* WhatsApp Channel Card */}
          <div className="relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs opacity-90 overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Radio className="w-5 h-5" strokeWidth={2.2} />
                </div>
                <Badge variant="default" className="text-[10px] font-bold">
                  Configured
                </Badge>
              </div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                WhatsApp Broadcasts
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">
                Meta Cloud API & Interakt templates for instant site visit invites and brochure PDFs.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Meta Business Verified</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          {/* Portals & Ads Channel Card */}
          <div className="relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs opacity-90 overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                  <Globe className="w-5 h-5" strokeWidth={2.2} />
                </div>
                <Badge variant="default" className="text-[10px] font-bold">
                  Connected
                </Badge>
              </div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                Portals & Meta Ads
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">
                Automatic lead ingestion from 99acres, MagicBricks, and Facebook Lead Ads.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Real-time Ingestion</span>
              <Users className="w-4 h-4 text-sky-500" />
            </div>
          </div>
        </div>
      </div>

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
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 ${activeChannelTab === "ALL"
                ? "bg-white text-[var(--text-primary)] shadow-xs"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
            >
              <span>All Broadcasts</span>
              <span className="text-[10px] font-mono opacity-80">({unifiedBroadcasts.length})</span>
            </button>
            <button
              onClick={() => setActiveChannelTab("EMAIL")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 ${activeChannelTab === "EMAIL"
                ? "bg-white text-purple-700 shadow-xs"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
            >
              <Mail className="w-3.5 h-3.5 text-purple-600" />
              <span>Email ({emailCampaigns.length})</span>
            </button>
            <button
              onClick={() => setActiveChannelTab("SMS")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 ${activeChannelTab === "SMS"
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
          <CampaignListTable campaigns={emailCampaigns} isLoading={loading} />
        )}

        {/* Tab View: SMS ONLY */}
        {activeChannelTab === "SMS" && (
          <SmsCampaignListTable campaigns={smsCampaigns} isLoading={loading} />
        )}

        {/* Tab View: ALL UNIFIED BROADCASTS */}
        {activeChannelTab === "ALL" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[var(--text-secondary)]">
                <thead className="bg-slate-50/90 text-[11px] font-extrabold uppercase text-[var(--text-tertiary)] tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-3.5 px-4">Channel & Broadcast</th>
                    <th className="py-3.5 px-4">Project</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Performance</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 text-right">Analytics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {unifiedBroadcasts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-14 text-center text-slate-400">
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-[var(--brand-600)] mx-auto mb-2.5">
                          <Send className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">No marketing broadcasts found</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          Launch your first Email or SMS broadcast to start reaching leads.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    unifiedBroadcasts.map((item) => {
                      const isEmail = item.type === "EMAIL";
                      const statusMeta =
                        CAMPAIGN_STATUS_CONFIG[item.status as keyof typeof CAMPAIGN_STATUS_CONFIG] || CAMPAIGN_STATUS_CONFIG.DRAFT;

                      return (
                        <tr
                          key={`${item.type}-${item.id}`}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          {/* Channel & Broadcast Title */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isEmail
                                  ? "bg-purple-50 text-purple-600"
                                  : "bg-amber-50 text-amber-600"
                                  }`}
                              >
                                {isEmail ? (
                                  <Mail className="w-4 h-4" />
                                ) : (
                                  <MessageSquare className="w-4 h-4" />
                                )}
                              </div>
                              <div className="min-w-0 max-w-sm">
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={item.detailUrl}
                                    className="font-extrabold text-[var(--text-primary)] hover:text-[var(--brand-600)] transition-colors truncate"
                                  >
                                    {item.title}
                                  </Link>
                                  <span
                                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${isEmail
                                      ? "bg-purple-100/70 text-purple-700"
                                      : "bg-amber-100/70 text-amber-800"
                                      }`}
                                  >
                                    {item.type}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[var(--text-tertiary)] truncate mt-0.5">
                                  {item.previewText}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Project */}
                          <td className="py-3.5 px-4 font-medium text-[var(--text-secondary)]">
                            {item.projectName || "General Audience"}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${statusMeta.bg}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {statusMeta.label}
                            </span>
                          </td>

                          {/* Performance */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3 text-xs">
                              <div>
                                <span className="font-extrabold text-[var(--text-primary)]">
                                  {item.deliveredCount.toLocaleString()}
                                </span>
                                <span className="text-[11px] text-[var(--text-tertiary)] ml-1">
                                  sent
                                </span>
                              </div>
                              {isEmail && typeof item.openedCount === "number" && (
                                <div className="text-purple-600 font-semibold flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  <span>{item.openedCount} opens</span>
                                </div>
                              )}
                              <div className="text-emerald-600 font-semibold flex items-center gap-1">
                                <MousePointer className="w-3 h-3" />
                                <span>{item.clickedCount} clicks</span>
                              </div>
                            </div>
                          </td>

                          {/* Created Date */}
                          <td className="py-3.5 px-4 text-xs font-medium text-[var(--text-tertiary)]">
                            {new Date(item.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>

                          {/* Action Link */}
                          <td className="py-3.5 px-4 text-right">
                            <Link href={item.detailUrl}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs font-bold gap-1 text-[var(--brand-600)] hover:text-[var(--brand-700)]"
                              >
                                <span>View Funnel</span>
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardPageWrapper>
  );
}
