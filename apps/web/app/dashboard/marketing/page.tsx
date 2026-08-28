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
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CampaignListTable } from "@/features/marketing/components/CampaignListTable";
import type { CampaignItem } from "@/features/marketing/types";

export default function MarketingHubPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  useEffect(() => {
    async function loadCampaigns() {
      try {
        setLoading(true);
        const res = await fetch(`${baseUrl}/api/marketing/campaigns`);
        if (res.ok) {
          const data = await res.json();
          setCampaigns(data?.items || []);
        } else {
          setCampaigns([]);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load marketing dashboard");
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    }

    loadCampaigns();
  }, [baseUrl]);

  const totalSent = campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0);
  const totalDelivered = campaigns.reduce((acc, c) => acc + (c.deliveredCount || 0), 0);
  const totalOpened = campaigns.reduce((acc, c) => acc + (c.openedCount || 0), 0);
  const totalClicked = campaigns.reduce((acc, c) => acc + (c.clickedCount || 0), 0);

  const avgOpenRate = totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : "0.0";
  const avgClickRate = totalDelivered > 0 ? ((totalClicked / totalDelivered) * 100).toFixed(1) : "0.0";

  const statItems = [
    {
      label: "Total Broadcasts Sent",
      value: totalSent.toLocaleString(),
      icon: Send,
      accent: "oklch(0.55 0.22 310)", // Purple / Marketing
      sub: "Across all active campaigns",
    },
    {
      label: "Overall Delivery Rate",
      value: totalSent > 0 ? `${((totalDelivered / totalSent) * 100).toFixed(1)}%` : "0.0%",
      icon: CheckCircle2,
      accent: "oklch(0.45 0.16 145)", // Emerald
      sub: "High inbox deliverability",
    },
    {
      label: "Average Open Rate",
      value: `${avgOpenRate}%`,
      icon: Sparkles,
      accent: "oklch(0.48 0.18 240)", // Royal Blue
      sub: "Active buyer engagement",
    },
    {
      label: "Link Clicks & Intent",
      value: totalClicked.toLocaleString(),
      icon: TrendingUp,
      accent: "oklch(0.50 0.17 80)", // Amber Gold
      sub: `${avgClickRate}% CTR on project links`,
    },
  ];

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      title="Marketing Suite"
      subtitle="Omnichannel marketing hub across Email Broadcasts, WhatsApp Campaigns, SMS, and Portal Integrations."
      headerRight={
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/marketing/email/settings">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="w-3.5 h-3.5" />
              <span>Integrations & BYO</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/email/campaigns/new">
            <Button variant="default" size="sm" className="gap-2 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ New Campaign</span>
            </Button>
          </Link>
        </div>
      }
    >
      {/* ── Top Metric KPI Cards ── */}
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
            className="group relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-[var(--brand-300)] hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Mail className="w-5 h-5" strokeWidth={2.2} />
                </div>
                <Badge variant="success" className="text-[10px] font-bold">
                  Active Engine
                </Badge>
              </div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-[var(--brand-600)] transition-colors">
                Email Marketing
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">
                Broadcast project launches, price drops, and commission alerts with AWS SES, SendGrid, Brevo & Mailchimp.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[var(--brand-600)]">
              <span>Open Email Engine</span>
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

          {/* SMS Channel Card */}
          <div className="relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs opacity-90 overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <MessageSquare className="w-5 h-5" strokeWidth={2.2} />
                </div>
                <Badge variant="default" className="text-[10px] font-bold">
                  DLT Ready
                </Badge>
              </div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                SMS Campaigns
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">
                Fast promotional & transactional SMS routing via Twilio & Gupshup with DLT headers.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
              <span>100% Delivery SLA</span>
              <Zap className="w-4 h-4 text-amber-500" />
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

      {/* ── Recent Campaigns Section ── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">
              All Marketing Broadcasts
            </h2>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Real-time audit log of all dispatched campaigns and engagement rates.
            </p>
          </div>
          <Link href="/dashboard/marketing/email/campaigns/new">
            <Button variant="outline" size="sm" className="text-xs font-bold gap-1.5">
              <span>Launch New Campaign</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <CampaignListTable campaigns={campaigns} isLoading={loading} />
      </div>
    </DashboardPageWrapper>
  );
}
