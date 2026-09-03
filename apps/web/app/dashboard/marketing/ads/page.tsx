"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Globe,
  RefreshCw,
  Plus,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Eye,
  Sparkles,
  Layers,
  Video,
} from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";
import { GoogleIcon } from "@/features/marketing/ads/google/components/GoogleIcon";
import { YouTubeIcon } from "@/features/marketing/ads/youtube/components/YouTubeIcon";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MetaConnectModal } from "@/features/marketing/ads/meta/components/MetaConnectModal";

export default function MasterAdsOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const [metaCampaigns, setMetaCampaigns] = useState<any[]>([]);
  const [instagramCampaigns, setInstagramCampaigns] = useState<any[]>([]);
  const [googleCampaigns, setGoogleCampaigns] = useState<any[]>([]);
  const [youtubeCampaigns, setYouTubeCampaigns] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);

  const [metaKpis, setMetaKpis] = useState<any>({
    totalSpend: 0,
    totalLeads: 0,
    avgCpl: 0,
    totalImpressions: 0,
    activeCampaignsCount: 0,
  });

  const [instagramKpis, setInstagramKpis] = useState<any>({
    totalSpend: 0,
    totalLeads: 0,
    avgCpl: 0,
    totalImpressions: 0,
    activeCampaignsCount: 0,
  });

  const [googleKpis, setGoogleKpis] = useState<any>({
    totalSpend: 0,
    totalConversions: 0,
    avgCostPerConversion: 0,
    totalImpressions: 0,
    activeCampaignsCount: 0,
  });

  const [youtubeKpis, setYouTubeKpis] = useState<any>({
    totalSpend: 0,
    totalViews: 0,
    avgCpv: 0,
    totalLeads: 0,
    totalImpressions: 0,
    activeCampaignsCount: 0,
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [integrationsRes, metaRes, instagramRes, googleRes, youtubeRes] = await Promise.all([
        fetch(`${baseUrl}/api/marketing/ads/meta/integrations`).catch(() => null),
        fetch(`${baseUrl}/api/marketing/ads/meta/campaigns`).catch(() => null),
        fetch(`${baseUrl}/api/marketing/ads/instagram/overview`).catch(() => null),
        fetch(`${baseUrl}/api/marketing/ads/google/campaigns`).catch(() => null),
        fetch(`${baseUrl}/api/marketing/ads/youtube/overview`).catch(() => null),
      ]);

      if (integrationsRes && integrationsRes.ok) {
        const intData = await integrationsRes.json();
        setIntegrations(Array.isArray(intData) ? intData : []);
      }

      if (metaRes && metaRes.ok) {
        const mData = await metaRes.json();
        setMetaCampaigns(mData?.items || []);
        if (mData?.kpis) setMetaKpis(mData.kpis);
      }

      if (instagramRes && instagramRes.ok) {
        const igData = await instagramRes.json();
        setInstagramCampaigns(igData?.items || []);
        if (igData?.kpis) setInstagramKpis(igData.kpis);
      }

      if (googleRes && googleRes.ok) {
        const gData = await googleRes.json();
        setGoogleCampaigns(gData?.items || []);
        if (gData?.kpis) setGoogleKpis(gData.kpis);
      }

      if (youtubeRes && youtubeRes.ok) {
        const yData = await youtubeRes.json();
        setYouTubeCampaigns(yData?.items || []);
        if (yData?.kpis) setYouTubeKpis(yData.kpis);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load master ads analytics");
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSyncAll = async () => {
    if (integrations.length === 0) {
      setIsConnectModalOpen(true);
      return;
    }

    try {
      setSyncing(true);
      const activeInt = integrations.find((i) => i.isActive) || integrations[0];
      await Promise.all([
        fetch(`${baseUrl}/api/marketing/ads/meta/integrations/${activeInt.id}/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ datePreset: "maximum" }),
        }),
        fetch(`${baseUrl}/api/marketing/ads/instagram/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ datePreset: "maximum" }),
        }),
      ]);

      await loadData();
    } catch (err: any) {
      setError(err?.message || "Sync operation failed");
    } finally {
      setSyncing(false);
    }
  };

  const formatCurrency = (val: number, cur: string = "INR") => {
    if (cur === "INR") {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${Math.round(val).toLocaleString("en-IN")}`;
    }
    return `$${Math.round(val).toLocaleString("en-US")}`;
  };

  // Blended Aggregates
  const totalCombinedSpend =
    (metaKpis.totalSpend || 0) +
    (instagramKpis.totalSpend || 0) +
    (googleKpis.totalSpend || 0) +
    (youtubeKpis.totalSpend || 0);
  const totalCombinedLeads =
    (metaKpis.totalLeads || 0) +
    (instagramKpis.totalLeads || 0) +
    (googleKpis.totalConversions || 0) +
    (youtubeKpis.totalLeads || 0);
  const blendedCpl =
    totalCombinedLeads > 0 ? totalCombinedSpend / totalCombinedLeads : 0;
  const totalCombinedImpressions =
    (metaKpis.totalImpressions || 0) +
    (instagramKpis.totalImpressions || 0) +
    (googleKpis.totalImpressions || 0) +
    (youtubeKpis.totalImpressions || 0);

  // Combine campaigns list with platform attribution
  const combinedCampaigns = [
    ...metaCampaigns.map((c) => ({ ...c, platform: "FACEBOOK" })),
    ...instagramCampaigns.map((c) => ({ ...c, platform: "INSTAGRAM" })),
    ...googleCampaigns.map((c) => ({ ...c, platform: "GOOGLE" })),
    ...youtubeCampaigns.map((c) => ({ ...c, platform: "YOUTUBE" })),
  ];

  // Remove duplicates by ID
  const uniqueCampaigns = Array.from(
    new Map(combinedCampaigns.map((item) => [item.id, item])).values()
  );

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      title="Advertising Command Center"
      subtitle="Unified overview of digital ad performance, spend, CPL, and lead form conversions across Facebook & Instagram."
      headerRight={
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/marketing">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Marketing Hub</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncAll}
            disabled={syncing || loading || integrations.length === 0}
            className="gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing All..." : "Sync All Live Data"}</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setIsConnectModalOpen(true)}
            className="gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Ad Account</span>
          </Button>
        </div>
      }
    >
      {/* ── Top Blended Cross-Platform KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
              Total Digital Ad Spend
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold shadow-xs">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            {formatCurrency(totalCombinedSpend)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[var(--text-tertiary)]">
            <span className="text-blue-600 font-bold">
              {metaCampaigns.length + instagramCampaigns.length} Campaigns
            </span>
            <span>across FB & IG</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
              Total CRM Leads Acquired
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold shadow-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-emerald-600">
            {totalCombinedLeads.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[var(--text-tertiary)]">
            <span className="text-emerald-600 font-bold">Instant Forms & DM</span>
            <span>direct CRM sync</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
              Blended Cost Per Lead
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-extrabold shadow-xs">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            {totalCombinedLeads > 0 ? formatCurrency(blendedCpl) : "—"}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[var(--text-tertiary)]">
            <span className="text-amber-600 font-bold">Optimal CPL</span>
            <span>cross-platform average</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
              Total Impressions
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-extrabold shadow-xs">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            {totalCombinedImpressions.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[var(--text-tertiary)]">
            <span className="text-purple-600 font-bold">Brand Exposure</span>
            <span>across all placements</span>
          </div>
        </div>
      </div>

      {/* ── Multi-Platform Launchpad Cards ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">
              Advertising Channels
            </h2>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Select an ad engine for specialized creative inspection, placement breakdowns, and settings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Meta (Facebook) Ads Engine Card */}
          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-xs hover:border-blue-400 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-xl shadow-xs">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-[10px] font-bold">
                    Active Engine
                  </Badge>
                  <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {metaCampaigns.length} Campaigns
                  </span>
                </div>
              </div>

              <h3 className="text-base font-black text-[var(--text-primary)]">
                Meta (Facebook) Ads
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-1.5 leading-relaxed">
                Desktop & Mobile Feed, Instant Lead Forms, and Messenger campaigns across Facebook.
              </p>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">
                    Spend
                  </span>
                  <span className="text-sm font-black text-[var(--text-primary)] mt-0.5 block">
                    {formatCurrency(metaKpis.totalSpend || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">
                    Leads
                  </span>
                  <span className="text-sm font-black text-emerald-600 mt-0.5 block">
                    {(metaKpis.totalLeads || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">
                    Avg CPL
                  </span>
                  <span className="text-sm font-black text-[var(--text-primary)] mt-0.5 block">
                    {metaKpis.totalLeads > 0 ? formatCurrency(metaKpis.avgCpl || 0) : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link href="/dashboard/marketing/ads/meta/settings" className="text-xs font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                Settings
              </Link>
              <Link href="/dashboard/marketing/ads/meta">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 shadow-xs">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* 2. Instagram Ads Dedicated Suite Card */}
          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-xs hover:border-pink-400 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center font-extrabold text-xl shadow-xs">
                  <Instagram className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-[10px] font-bold">
                    Active Suite
                  </Badge>
                  <span className="text-xs font-extrabold text-pink-700 bg-pink-50 px-2.5 py-1 rounded-lg">
                    {instagramCampaigns.length} Campaigns
                  </span>
                </div>
              </div>

              <h3 className="text-base font-black text-[var(--text-primary)]">
                Instagram Ads
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-1.5 leading-relaxed">
                9:16 vertical Reels & Stories walk-throughs, Explore discovery grid, and DM capture.
              </p>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">
                    Spend
                  </span>
                  <span className="text-sm font-black text-[var(--text-primary)] mt-0.5 block">
                    {formatCurrency(instagramKpis.totalSpend || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">
                    IG Leads
                  </span>
                  <span className="text-sm font-black text-emerald-600 mt-0.5 block">
                    {(instagramKpis.totalLeads || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">
                    Avg CPL
                  </span>
                  <span className="text-sm font-black text-[var(--text-primary)] mt-0.5 block">
                    {instagramKpis.totalLeads > 0 ? formatCurrency(instagramKpis.avgCpl || 0) : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link href="/dashboard/marketing/ads/instagram/settings" className="text-xs font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                Settings
              </Link>
              <Link href="/dashboard/marketing/ads/instagram">
                <Button size="sm" className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:opacity-90 text-white text-xs font-bold gap-1.5 shadow-xs">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* 3. Google Ads Engine Card */}
          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-xs hover:border-emerald-400 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-blue-500 via-red-500 via-yellow-500 to-green-500" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-xl shadow-xs">
                  <GoogleIcon size={24} />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-[10px] font-bold">
                    Active Engine
                  </Badge>
                  <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {googleCampaigns.length} Campaigns
                  </span>
                </div>
              </div>

              <h3 className="text-base font-black text-[var(--text-primary)]">
                Google Search Ads
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-1.5 leading-relaxed">
                High-intent Google Search keywords, Quality Score diagnostics, and Lead Form webhooks.
              </p>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">
                    Spend
                  </span>
                  <span className="text-sm font-black text-[var(--text-primary)] mt-0.5 block">
                    {formatCurrency(googleKpis.totalSpend || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">
                    Leads
                  </span>
                  <span className="text-sm font-black text-emerald-600 mt-0.5 block">
                    {(googleKpis.totalConversions || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">
                    Cost/Conv
                  </span>
                  <span className="text-sm font-black text-[var(--text-primary)] mt-0.5 block">
                    {googleKpis.totalConversions > 0 ? formatCurrency(googleKpis.avgCostPerConversion || 0) : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link href="/dashboard/marketing/ads/google/settings" className="text-xs font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                Settings
              </Link>
              <Link href="/dashboard/marketing/ads/google">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-xs">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* 4. YouTube Video Ads Hub Card */}
          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-xs hover:border-rose-400 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-extrabold text-xl shadow-xs">
                  <YouTubeIcon size={24} />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-[10px] font-bold">
                    Active Video
                  </Badge>
                  <span className="text-xs font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                    {youtubeCampaigns.length} Videos
                  </span>
                </div>
              </div>

              <h3 className="text-base font-black text-[var(--text-primary)]">
                YouTube Video Ads
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-1.5 leading-relaxed">
                4K property walkthroughs, drone tour views, CPV optimization, and audience retention funnels.
              </p>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">
                    Spend
                  </span>
                  <span className="text-sm font-black text-[var(--text-primary)] mt-0.5 block">
                    {formatCurrency(youtubeKpis.totalSpend || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">
                    Views
                  </span>
                  <span className="text-sm font-black text-rose-600 mt-0.5 block">
                    {(youtubeKpis.totalViews || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">
                    Avg CPV
                  </span>
                  <span className="text-sm font-black text-blue-600 mt-0.5 block">
                    ₹{(youtubeKpis.avgCpv || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link href="/dashboard/marketing/ads/google/settings" className="text-xs font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                Settings
              </Link>
              <Link href="/dashboard/marketing/ads/youtube">
                <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-1.5 shadow-xs">
                  <span>Open Video Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Unified Cross-Platform Campaigns Feed ── */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">
              All Synced Digital Campaigns ({uniqueCampaigns.length})
            </h2>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Cross-platform performance feed with direct lead acquisition and spend metrics.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-tertiary)]">
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Spend</th>
                  <th className="py-3 px-4">Leads</th>
                  <th className="py-3 px-4">Cost / Lead</th>
                  <th className="py-3 px-4">CTR</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {uniqueCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <span>No digital ad campaigns synced yet. Click "Connect Ad Account" to begin.</span>
                    </td>
                  </tr>
                ) : (
                  uniqueCampaigns.map((camp) => {
                    const isYouTube = camp.platform === "YOUTUBE";
                    const isIg = camp.platform === "INSTAGRAM";
                    const isGoogle = camp.platform === "GOOGLE";
                    const inspectHref = isYouTube
                      ? `/dashboard/marketing/ads/youtube/campaigns/${camp.id}`
                      : isGoogle
                        ? `/dashboard/marketing/ads/google/campaigns/${camp.id}`
                        : isIg
                          ? `/dashboard/marketing/ads/instagram/campaigns/${camp.id}`
                          : `/dashboard/marketing/ads/meta/campaigns/${camp.id}`;

                    return (
                      <tr key={camp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          {isYouTube ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                              <YouTubeIcon size={12} />
                              <span>YouTube</span>
                            </span>
                          ) : isGoogle ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                              <GoogleIcon size={12} />
                              <span>Google</span>
                            </span>
                          ) : isIg ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black bg-pink-50 text-pink-700 border border-pink-200">
                              <Instagram className="w-3 h-3" />
                              <span>Instagram</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                              <Globe className="w-3 h-3" />
                              <span>Facebook</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">
                          <Link href={inspectHref} className="hover:underline">
                            {camp.name}
                          </Link>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${camp.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                              : "bg-amber-50 text-amber-700 border border-amber-200/80"
                              }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${camp.status === "ACTIVE" ? "bg-emerald-500" : "bg-amber-500"}`} />
                            {camp.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">
                          {formatCurrency(camp.spend || 0)}
                        </td>

                        <td className="py-3.5 px-4 font-black text-emerald-600">
                          {(camp.leadsCount || 0).toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">
                          {camp.leadsCount > 0 ? formatCurrency(camp.costPerLead || 0) : "—"}
                        </td>

                        <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                          {camp.ctr ? `${camp.ctr.toFixed(1)}%` : "0%"}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <Link href={inspectHref}>
                            <Button variant="outline" size="sm" className="gap-1 text-xs font-bold">
                              <span>Inspect</span>
                              <ArrowRight className="w-3 h-3" />
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
      </div>

      <MetaConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={loadData}
      />
    </DashboardPageWrapper>
  );
}
