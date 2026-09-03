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
  Globe,
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
      subtitle={`Campaign ID: ${campaignId} · Account: ${campaign?.integration?.name || "Meta Ad Account"}`}
      headerRight={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/marketing/ads/meta">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Campaigns</span>
            </Button>
          </Link>
        </div>
      }
    >
      {/* ── Breadcrumb Bar ── */}
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] font-medium">
        <Link href="/dashboard/marketing" className="hover:text-[var(--text-primary)]">
          Marketing
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/dashboard/marketing/ads/meta" className="hover:text-[var(--text-primary)]">
          Ads Marketing
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[var(--text-primary)] font-bold truncate max-w-xs">
          {campaign?.name || "Campaign"}
        </span>
      </div>

      {/* ── Campaign Header Card ── */}
      {campaign && (
        <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                    campaign.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                      : "bg-amber-50 text-amber-700 border border-amber-200/80"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      campaign.status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`}
                  />
                  {campaign.status}
                </span>

                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                  {campaign.objective}
                </span>

                {campaign.dailyBudget ? (
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    Daily Budget: <strong className="text-[var(--text-primary)] font-extrabold">{formatCurrency(campaign.dailyBudget, currency)}</strong>
                  </span>
                ) : null}
              </div>

              <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
                {campaign.name}
              </h2>
            </div>

            <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)] font-medium">
              {campaign.startTime && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>
                    Started: {new Date(campaign.startTime).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* KPI Snapshot Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                Total Ad Spend
              </span>
              <span className="text-lg font-black text-[var(--text-primary)] mt-1 block">
                {formatCurrency(campaign.spend || 0, currency)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                Leads Captured
              </span>
              <span className="text-lg font-black text-emerald-600 mt-1 block">
                {(campaign.leadsCount || 0).toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                Cost Per Lead
              </span>
              <span className="text-lg font-black text-[var(--text-primary)] mt-1 block">
                {campaign.leadsCount > 0 ? formatCurrency(campaign.costPerLead || 0, currency) : "—"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                Impressions & CTR
              </span>
              <span className="text-lg font-black text-[var(--text-primary)] mt-1 block">
                {(campaign.impressions || 0).toLocaleString()} · {campaign.ctr ? `${campaign.ctr.toFixed(1)}%` : "0%"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Sub-Tabs Navigation ── */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab("CREATIVES")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === "CREATIVES"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-[var(--text-secondary)] hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Creatives Gallery ({campaign?.creativesData?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("ADSETS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === "ADSETS"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-[var(--text-secondary)] hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Ad Sets & Targeting ({campaign?.adSetsData?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("LEADS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === "LEADS"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-[var(--text-secondary)] hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Acquired Leads ({acquiredLeads.length})</span>
        </button>
      </div>

      {/* ── Tab Content Views ── */}
      <div className="space-y-4">
        {activeTab === "CREATIVES" && (
          <MetaCreativeGallery creatives={(campaign?.creativesData as any) || []} />
        )}

        {activeTab === "ADSETS" && (
          <MetaAdSetBreakdown adSets={(campaign?.adSetsData as any) || []} currency={currency} />
        )}

        {activeTab === "LEADS" && (
          <MetaAcquiredLeadsTable leads={acquiredLeads} campaignName={campaign?.name} />
        )}
      </div>
    </DashboardPageWrapper>
  );
}
