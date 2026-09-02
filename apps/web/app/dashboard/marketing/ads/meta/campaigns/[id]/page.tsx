"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Layers,
  Image as ImageIcon,
  Users,
  DollarSign,
  Eye,
  MousePointerClick,
  Target,
  Clock,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MetaCreativeGallery } from "@/features/marketing/ads/meta/components/MetaCreativeGallery";
import { MetaAdSetBreakdown } from "@/features/marketing/ads/meta/components/MetaAdSetBreakdown";
import { MetaAcquiredLeadsTable } from "@/features/marketing/ads/meta/components/MetaAcquiredLeadsTable";
import type {
  MetaCampaignCacheItem,
  MetaAcquiredLeadItem,
} from "@/features/marketing/ads/meta/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MetaCampaignDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const campaignId = resolvedParams.id;

  const [campaign, setCampaign] = useState<MetaCampaignCacheItem | null>(null);
  const [acquiredLeads, setAcquiredLeads] = useState<MetaAcquiredLeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"CREATIVES" | "ADSETS" | "LEADS">("CREATIVES");

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  useEffect(() => {
    async function loadCampaignDetails() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${baseUrl}/api/marketing/ads/meta/campaigns/${campaignId}`);
        if (!res.ok) {
          throw new Error(`Failed to load campaign details (${res.status})`);
        }

        const data = await res.json();
        setCampaign(data.campaign);
        setAcquiredLeads(data.acquiredLeads || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load campaign");
      } finally {
        setLoading(false);
      }
    }

    loadCampaignDetails();
  }, [baseUrl, campaignId]);

  const formatCurrency = (val: number, cur: string = "INR") => {
    if (cur === "INR") {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${Math.round(val).toLocaleString("en-IN")}`;
    }
    return `$${Math.round(val).toLocaleString("en-US")}`;
  };

  const currency = campaign?.integration?.currency || "INR";

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      title={campaign?.name || "Campaign Details"}
      subtitle={`Meta Campaign ID: ${campaignId} · Account: ${campaign?.integration?.name || "Meta Ad Account"}`}
      headerRight={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/marketing/ads/meta">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Campaigns</span>
            </Button>
          </Link>
        </div>
      }
    >
      {/* ── Breadcrumb Bar ── */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
        <Link href="/dashboard/marketing" className="hover:text-zinc-600 dark:hover:text-zinc-200">
          Marketing
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/dashboard/marketing/ads/meta" className="hover:text-zinc-600 dark:hover:text-zinc-200">
          Meta Ads
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-900 dark:text-zinc-100 font-semibold truncate max-w-xs">
          {campaign?.name || "Campaign"}
        </span>
      </div>

      {/* ── Campaign Header Card ── */}
      {campaign && (
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    campaign.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      campaign.status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`}
                  />
                  {campaign.status}
                </span>

                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
                  {campaign.objective}
                </span>

                {campaign.dailyBudget ? (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Daily Budget: <strong>{formatCurrency(campaign.dailyBudget, currency)}/day</strong>
                  </span>
                ) : campaign.lifetimeBudget ? (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Lifetime Budget: <strong>{formatCurrency(campaign.lifetimeBudget, currency)}</strong>
                  </span>
                ) : null}
              </div>

              <h1 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
                {campaign.name}
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono self-start sm:self-auto">
              <span>Synced: {new Date(campaign.lastSyncedAt).toLocaleString()}</span>
            </div>
          </div>

          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Ad Spend</span>
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">
                {formatCurrency(campaign.spend, currency)}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30">
              <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                Leads Captured
              </span>
              <p className="text-base font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">
                {campaign.leadsCount}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30">
              <span className="text-[11px] font-medium text-purple-700 dark:text-purple-400">
                Cost Per Lead (CPL)
              </span>
              <p className="text-base font-bold text-purple-800 dark:text-purple-300 mt-0.5">
                {campaign.leadsCount > 0
                  ? formatCurrency(campaign.costPerLead || campaign.spend / campaign.leadsCount, currency)
                  : "—"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Impressions</span>
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">
                {campaign.impressions.toLocaleString()}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Clicks (CTR)</span>
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">
                {campaign.clicks.toLocaleString()}{" "}
                <span className="text-xs font-normal text-zinc-400">({campaign.ctr}%)</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Reach</span>
              <p className="text-base font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">
                {campaign.reach.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Sub-Tab Navigation Bar ── */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800 w-fit">
        <button
          onClick={() => setActiveTab("CREATIVES")}
          className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === "CREATIVES"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
          <span>Creatives Gallery</span>
          <span className="text-[10px] opacity-75 font-mono">
            ({campaign?.creativesData?.length || 0})
          </span>
        </button>

        <button
          onClick={() => setActiveTab("ADSETS")}
          className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === "ADSETS"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>Ad Sets & Targeting</span>
          <span className="text-[10px] opacity-75 font-mono">
            ({campaign?.adSetsData?.length || 0})
          </span>
        </button>

        <button
          onClick={() => setActiveTab("LEADS")}
          className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === "LEADS"
              ? "bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          <span>Acquired Leads in CRM</span>
          <span className="text-[10px] font-mono opacity-85">({acquiredLeads.length})</span>
        </button>
      </div>

      {/* ── Tab Content Views ── */}
      {activeTab === "CREATIVES" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Active Ad Creatives & Copy Variations
            </h3>
            <span className="text-xs text-zinc-400">
              Visual assets displayed across Instagram Reels, Stories & Facebook Feed
            </span>
          </div>
          <MetaCreativeGallery creatives={campaign?.creativesData || []} />
        </div>
      )}

      {activeTab === "ADSETS" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Ad Sets & Audience Profiling
            </h3>
            <span className="text-xs text-zinc-400">
              Demographic, geographic, and interest targeting filters configured in Meta Ads Manager
            </span>
          </div>
          <MetaAdSetBreakdown adSets={campaign?.adSetsData || []} currency={currency} />
        </div>
      )}

      {activeTab === "LEADS" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Acquired CRM Leads from this Campaign
            </h3>
            <span className="text-xs text-zinc-400">
              Direct form submissions ingested via Meta Instant Lead Form Webhooks
            </span>
          </div>
          <MetaAcquiredLeadsTable leads={acquiredLeads} campaignName={campaign?.name} />
        </div>
      )}
    </DashboardPageWrapper>
  );
}
