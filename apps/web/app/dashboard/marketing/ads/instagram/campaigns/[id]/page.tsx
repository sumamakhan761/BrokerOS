"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Smartphone,
  Users,
  DollarSign,
  Eye,
  Target,
  Clock,
  Calendar,
  Sparkles,
  ChevronRight,
  Video,
} from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { InstagramCreativeGallery } from "@/features/marketing/ads/instagram/components/InstagramCreativeGallery";
import { InstagramAdSetBreakdown } from "@/features/marketing/ads/instagram/components/InstagramAdSetBreakdown";
import { InstagramAcquiredLeadsTable } from "@/features/marketing/ads/instagram/components/InstagramAcquiredLeadsTable";
import type {
  InstagramCampaignOverviewItem,
  InstagramAcquiredLeadItem,
  InstagramCreativeData,
} from "@/features/marketing/ads/instagram/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InstagramCampaignDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const campaignId = resolvedParams.id;

  const [campaign, setCampaign] = useState<InstagramCampaignOverviewItem | null>(null);
  const [creatives, setCreatives] = useState<InstagramCreativeData[]>([]);
  const [adSets, setAdSets] = useState<any[]>([]);
  const [acquiredLeads, setAcquiredLeads] = useState<InstagramAcquiredLeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"CREATIVES" | "ADSETS" | "LEADS">("CREATIVES");

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  useEffect(() => {
    async function loadCampaignDetails() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${baseUrl}/api/marketing/ads/instagram/campaigns/${campaignId}`);
        if (!res.ok) {
          throw new Error(`Failed to load Instagram campaign details (${res.status})`);
        }

        const data = await res.json();
        setCampaign(data.campaign);
        setCreatives(data.creatives || []);
        setAdSets(data.adSets || []);
        setAcquiredLeads(data.acquiredLeads || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load Instagram campaign");
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
      title={campaign?.name || "Instagram Campaign Details"}
      subtitle={`Campaign ID: ${campaignId} · Account: ${campaign?.integration?.name || "Instagram Ad Account"}`}
      headerRight={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/marketing/ads/instagram">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Instagram Ads</span>
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
        <Link href="/dashboard/marketing/ads" className="hover:text-[var(--text-primary)]">
          Ads Hub
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/dashboard/marketing/ads/instagram" className="hover:text-[var(--text-primary)]">
          Instagram Ads
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[var(--text-primary)] font-bold truncate max-w-xs">
          {campaign?.name || "Campaign"}
        </span>
      </div>

      {/* ── Campaign Header Card ── */}
      {campaign && (
        <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-xs space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500" />
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

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200/80">
                  <Instagram className="w-3 h-3" />
                  <span>{campaign.objective}</span>
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
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                Total IG Ad Spend
              </span>
              <span className="text-lg font-black text-[var(--text-primary)] mt-1 block">
                {formatCurrency(campaign.spend || 0, currency)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                Leads Captured
              </span>
              <span className="text-lg font-black text-emerald-600 mt-1 block">
                {(campaign.leadsCount || 0).toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                Cost Per Lead (CPL)
              </span>
              <span className="text-lg font-black text-[var(--text-primary)] mt-1 block">
                {campaign.leadsCount > 0 ? formatCurrency(campaign.costPerLead || 0, currency) : "—"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === "CREATIVES"
              ? "bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-xs"
              : "bg-white text-[var(--text-secondary)] hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>9:16 Creatives Gallery ({creatives.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ADSETS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === "ADSETS"
              ? "bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-xs"
              : "bg-white text-[var(--text-secondary)] hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Ad Sets & Targeting ({adSets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("LEADS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === "LEADS"
              ? "bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-xs"
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
          <InstagramCreativeGallery creatives={creatives} />
        )}

        {activeTab === "ADSETS" && (
          <InstagramAdSetBreakdown adSets={adSets} currency={currency} />
        )}

        {activeTab === "LEADS" && (
          <InstagramAcquiredLeadsTable leads={acquiredLeads} campaignName={campaign?.name} />
        )}
      </div>
    </DashboardPageWrapper>
  );
}
