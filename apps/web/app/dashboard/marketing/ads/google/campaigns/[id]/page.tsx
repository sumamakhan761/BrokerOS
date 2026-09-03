"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Target,
  DollarSign,
  TrendingUp,
  FileText,
  Users,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  ChevronRight,
  Eye,
  MousePointerClick,
  Award,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GoogleIcon } from "@/features/marketing/ads/google/components/GoogleIcon";
import { GoogleKeywordBreakdown } from "@/features/marketing/ads/google/components/GoogleKeywordBreakdown";
import { GoogleAcquiredLeadsTable } from "@/features/marketing/ads/google/components/GoogleAcquiredLeadsTable";
import type {
  GoogleCampaignItem,
  GoogleKeywordItem,
  GoogleAcquiredLeadItem,
} from "@/features/marketing/ads/google/types";
import { GOOGLE_CHANNEL_CONFIG } from "@brokeros/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GoogleCampaignDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const campaignId = resolvedParams.id;

  const [activeTab, setActiveTab] = useState<"KEYWORDS" | "ASSETS" | "LEADS">("KEYWORDS");
  const [campaign, setCampaign] = useState<GoogleCampaignItem | null>(null);
  const [keywords, setKeywords] = useState<GoogleKeywordItem[]>([]);
  const [acquiredLeads, setAcquiredLeads] = useState<GoogleAcquiredLeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  useEffect(() => {
    async function loadCampaignDetails() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${baseUrl}/api/marketing/ads/google/campaigns/${campaignId}`);
        if (!res.ok) {
          throw new Error(`Failed to load campaign details (${res.status})`);
        }

        const data = await res.json();
        if (data?.campaign) {
          setCampaign(data.campaign);
          setKeywords(data.keywords || []);
          setAcquiredLeads(data.acquiredLeads || []);
        } else {
          setCampaign(null);
          setKeywords([]);
          setAcquiredLeads([]);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load campaign");
      } finally {
        setLoading(false);
      }
    }

    loadCampaignDetails();
  }, [baseUrl, campaignId]);

  const formatCurrency = (val: number, cur: string = "INR") => {
    if (cur === "INR" || cur === "₹") {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${Math.round(val).toLocaleString("en-IN")}`;
    }
    return `$${Math.round(val).toLocaleString("en-US")}`;
  };

  const channel =
    GOOGLE_CHANNEL_CONFIG[
    campaign?.advertisingChannelType as keyof typeof GOOGLE_CHANNEL_CONFIG
    ] || GOOGLE_CHANNEL_CONFIG.SEARCH;

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      title={campaign?.name || "Google Campaign Details"}
      subtitle={`Campaign ID: ${campaignId} · Channel: ${channel.label} · Status: ${campaign?.status || "ENABLED"}`}
      headerRight={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/marketing/ads/google">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Google Ads</span>
            </Button>
          </Link>
        </div>
      }
    >
      {/* ── Breadcrumb Bar ── */}
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-tertiary)] -mt-2">
        <Link href="/dashboard/marketing/ads" className="hover:text-[var(--text-primary)]">
          Ads Hub
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/dashboard/marketing/ads/google" className="hover:text-[var(--text-primary)] flex items-center gap-1">
          <GoogleIcon size={12} />
          <span>Google Ads</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[var(--text-primary)] font-bold truncate max-w-xs">
          {campaign?.name || campaignId}
        </span>
      </div>

      {/* ── Performance Metrics Summary Cards ── */}
      {campaign && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                Total Spend
              </span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 shadow-xs">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              {formatCurrency(campaign.spend || 0)}
            </div>
            <div className="text-xs font-medium text-[var(--text-secondary)] mt-1">
              Budget: {formatCurrency(campaign.dailyBudget || 0)}/day
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                Conversions / Leads
              </span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 shadow-xs">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600 tracking-tight">
              {(campaign.conversions || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-xs font-medium text-[var(--text-secondary)] mt-1">
              Lead form & call conversions
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                Cost / Conversion
              </span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600 shadow-xs">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              {formatCurrency(campaign.costPerConversion || 0)}
            </div>
            <div className="text-xs font-medium text-[var(--text-secondary)] mt-1">
              Effective acquisition cost
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                Impressions
              </span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600 shadow-xs">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              {(campaign.impressions || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-xs font-medium text-[var(--text-secondary)] mt-1">
              {(campaign.clicks || 0).toLocaleString("en-IN")} total clicks
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                CTR & Avg CPC
              </span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-50 text-rose-600 shadow-xs">
                <MousePointerClick className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              {campaign.ctr || 0}%
            </div>
            <div className="text-xs font-medium text-[var(--text-secondary)] mt-1">
              Avg CPC: {formatCurrency(campaign.cpc || 0)}
            </div>
          </div>
        </div>
      )}

      {/* ── Drill-Down Tabs Navigation ── */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab("KEYWORDS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "KEYWORDS"
            ? "bg-blue-600 text-white shadow-xs"
            : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-slate-100/80"
            }`}
        >
          <Search className="w-4 h-4" />
          <span>Keywords & Quality Scores ({keywords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ASSETS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "ASSETS"
            ? "bg-blue-600 text-white shadow-xs"
            : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-slate-100/80"
            }`}
        >
          <FileText className="w-4 h-4" />
          <span>Ad Copy & Asset Groups</span>
        </button>

        <button
          onClick={() => setActiveTab("LEADS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "LEADS"
            ? "bg-blue-600 text-white shadow-xs"
            : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-slate-100/80"
            }`}
        >
          <Users className="w-4 h-4" />
          <span>Inbound Leads Captured ({acquiredLeads.length})</span>
        </button>
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "KEYWORDS" && (
        <GoogleKeywordBreakdown keywords={keywords} currency="INR" />
      )}

      {activeTab === "ASSETS" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Responsive Search Ad Mockup */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-red-500 to-amber-500" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GoogleIcon size={16} />
                <h3 className="font-extrabold text-[var(--text-primary)] text-sm">
                  Google Search SERP Preview
                </h3>
              </div>
              <Badge variant="success" className="text-[10px] font-bold">
                Ad Strength: Excellent
              </Badge>
            </div>

            {/* Google Search Result Card */}
            <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/80 font-sans space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-800">Sponsored</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 text-[11px]">https://brokeros.in/godrej-palm-retreat</span>
              </div>
              <h4 className="text-base font-semibold text-blue-700 hover:underline cursor-pointer">
                Godrej Palm Retreat | Ultra Luxury 3 & 4 BHK in Gurgaon
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Discover Resort-Style Living with 50+ Modern Amenities, Golf Course View & Private Clubhouse. Download Floor Plans & Schedule Site Visit.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="text-blue-700 hover:underline cursor-pointer">3 & 4 BHK Floor Plans</span>
                <span className="text-slate-300">|</span>
                <span className="text-blue-700 hover:underline cursor-pointer">Price List & Payment Plans</span>
                <span className="text-slate-300">|</span>
                <span className="text-blue-700 hover:underline cursor-pointer">Book Site Visit</span>
              </div>
            </div>
          </div>

          {/* Ad Copy Asset Headlines */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="font-extrabold text-[var(--text-primary)] text-sm">
              Headlines & Descriptions Catalog
            </h3>
            <div className="space-y-2">
              {[
                { text: "Godrej Palm Retreat Gurgaon", type: "Headline 1", char: "26 / 30" },
                { text: "Ultra Luxury 3 & 4 BHK Flats", type: "Headline 2", char: "27 / 30" },
                { text: "Starting ₹2.85 Cr* Onwards", type: "Headline 3", char: "25 / 30" },
                { text: "Resort-Style Living with 50+ Amenities", type: "Description 1", char: "37 / 90" },
                { text: "Private Clubhouse, 80% Green Open Area", type: "Description 2", char: "38 / 90" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80">
                      {item.type}
                    </span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {item.text}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                    {item.char}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "LEADS" && (
        <GoogleAcquiredLeadsTable leads={acquiredLeads} currency="INR" />
      )}
    </DashboardPageWrapper>
  );
}
