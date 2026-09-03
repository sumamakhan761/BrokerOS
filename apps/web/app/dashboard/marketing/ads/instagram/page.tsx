"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Settings,
  Plus,
  ArrowLeft,
  Video,
  Sparkles,
  Layers,
} from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { InstagramKpiCards } from "@/features/marketing/ads/instagram/components/InstagramKpiCards";
import { InstagramPlacementBreakdownWidget } from "@/features/marketing/ads/instagram/components/InstagramPlacementBreakdown";
import { InstagramCampaignTable } from "@/features/marketing/ads/instagram/components/InstagramCampaignTable";
import { InstagramConnectModal } from "@/features/marketing/ads/instagram/components/InstagramConnectModal";
import type {
  InstagramCampaignOverviewItem,
  InstagramCampaignSummaryKpis,
  InstagramPlacementBreakdown,
  InstagramIntegrationItem,
} from "@/features/marketing/ads/instagram/types";

export default function InstagramAdsOverviewPage() {
  const [integrations, setIntegrations] = useState<InstagramIntegrationItem[]>([]);
  const [campaigns, setCampaigns] = useState<InstagramCampaignOverviewItem[]>([]);
  const [placementBreakdown, setPlacementBreakdown] = useState<InstagramPlacementBreakdown | undefined>();
  const [kpis, setKpis] = useState<InstagramCampaignSummaryKpis>({
    totalSpend: 0,
    totalImpressions: 0,
    totalReach: 0,
    totalClicks: 0,
    totalLeads: 0,
    avgCpl: 0,
    avgCtr: 0,
    activeCampaignsCount: 0,
    totalCampaignsCount: 0,
    reelsViews: 0,
    storySwipeUps: 0,
  });

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [integrationsRes, overviewRes] = await Promise.all([
        fetch(`${baseUrl}/api/marketing/ads/meta/integrations`),
        fetch(`${baseUrl}/api/marketing/ads/instagram/overview`),
      ]);

      if (integrationsRes.ok) {
        const intData = await integrationsRes.json();
        setIntegrations(Array.isArray(intData) ? intData : []);
      }

      if (overviewRes.ok) {
        const ovData = await overviewRes.json();
        setCampaigns(ovData?.items || []);
        if (ovData?.kpis) setKpis(ovData.kpis);
        if (ovData?.placementBreakdown) setPlacementBreakdown(ovData.placementBreakdown);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load Instagram Ads data");
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSync = async () => {
    if (integrations.length === 0) {
      setIsConnectModalOpen(true);
      return;
    }

    try {
      setSyncing(true);
      const activeInt = integrations.find((i) => i.isActive) || integrations[0];
      const res = await fetch(`${baseUrl}/api/marketing/ads/instagram/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          integrationId: activeInt.id,
          datePreset: "maximum",
        }),
      });

      if (res.ok) {
        await loadData();
      }
    } catch (err: any) {
      setError(err?.message || "Sync operation failed");
    } finally {
      setSyncing(false);
    }
  };

  const primaryIntegration = integrations.find((i) => i.isDefault) || integrations[0];

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      title="Instagram Ads Dedicated Engine"
      subtitle="Track 9:16 vertical Reels & Stories campaigns, monitor Instagram CPL, inspect phone-frame creatives, and capture Instant Lead Form conversions."
      headerRight={
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/marketing/ads">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ads Hub</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/ads/instagram/settings">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
              <Settings className="w-3.5 h-3.5" />
              <span>IG Settings</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing || loading || integrations.length === 0}
            className="gap-1.5 text-xs font-bold text-pink-700 hover:text-pink-800 hover:bg-pink-50 border-pink-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing..." : "Sync Live IG Data"}</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setIsConnectModalOpen(true)}
            className="gap-1.5 text-xs font-black bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:opacity-90 text-white shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Instagram Ads</span>
          </Button>
        </div>
      }
    >
      {/* ── Active Instagram Account Banner ── */}
      {primaryIntegration && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500" />
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center font-extrabold text-base shadow-xs">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  {primaryIntegration.name}
                </h3>
                <Badge variant="success" className="text-[10px] font-bold">
                  Instagram Connected
                </Badge>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] font-mono mt-0.5">
                {primaryIntegration.adAccountId} · Currency: {primaryIntegration.currency}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
            {primaryIntegration.lastSyncedAt && (
              <span className="font-medium">
                Last Synced:{" "}
                <strong className="text-[var(--text-primary)] font-bold">
                  {new Date(primaryIntegration.lastSyncedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Instagram KPI Cards ── */}
      <InstagramKpiCards kpis={kpis} currency={primaryIntegration?.currency || "INR"} />

      {/* ── Placement Performance Breakdown (Reels vs Stories vs Feed vs Explore) ── */}
      <InstagramPlacementBreakdownWidget
        breakdown={placementBreakdown}
        currency={primaryIntegration?.currency || "INR"}
      />

      {/* ── Campaigns Table View ── */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">
              Active Instagram Campaigns
            </h2>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Real-time campaign performance across Reels & Stories with direct CRM lead acquisition stats.
            </p>
          </div>
        </div>

        <InstagramCampaignTable
          campaigns={campaigns}
          loading={loading}
          onSync={handleSync}
          syncing={syncing}
          hasIntegration={integrations.length > 0}
          onConnectClick={() => setIsConnectModalOpen(true)}
        />
      </div>

      {/* ── Connect Modal ── */}
      <InstagramConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={loadData}
      />
    </DashboardPageWrapper>
  );
}
