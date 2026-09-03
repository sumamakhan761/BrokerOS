"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  RefreshCw,
  Settings,
  Plus,
  ArrowLeft,
  Layers,
  Globe,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MetaKpiCards } from "@/features/marketing/ads/meta/components/MetaKpiCards";
import { MetaCampaignTable } from "@/features/marketing/ads/meta/components/MetaCampaignTable";
import { MetaConnectModal } from "@/features/marketing/ads/meta/components/MetaConnectModal";
import type {
  MetaCampaignCacheItem,
  MetaCampaignSummaryKpis,
  MetaIntegrationItem,
} from "@/features/marketing/ads/meta/types";

export default function MetaAdsOverviewPage() {
  const [integrations, setIntegrations] = useState<MetaIntegrationItem[]>([]);
  const [campaigns, setCampaigns] = useState<MetaCampaignCacheItem[]>([]);
  const [kpis, setKpis] = useState<MetaCampaignSummaryKpis>({
    totalSpend: 0,
    totalImpressions: 0,
    totalReach: 0,
    totalClicks: 0,
    totalLeads: 0,
    avgCpl: 0,
    avgCtr: 0,
    activeCampaignsCount: 0,
    totalCampaignsCount: 0,
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

      const [integrationsRes, campaignsRes] = await Promise.all([
        fetch(`${baseUrl}/api/marketing/ads/meta/integrations`),
        fetch(`${baseUrl}/api/marketing/ads/meta/campaigns`),
      ]);

      if (integrationsRes.ok) {
        const intData = await integrationsRes.json();
        setIntegrations(Array.isArray(intData) ? intData : []);
      }

      if (campaignsRes.ok) {
        const campData = await campaignsRes.json();
        setCampaigns(campData?.items || []);
        if (campData?.kpis) {
          setKpis(campData.kpis);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load Ads Marketing data");
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
      const res = await fetch(`${baseUrl}/api/marketing/ads/meta/integrations/${activeInt.id}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datePreset: "maximum" }),
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
      title="Meta (Facebook) Ads Engine"
      subtitle="Track Facebook Feed & Lead Form campaigns, monitor advertising spend & CPL, inspect ad creatives, and manage inbound CRM leads."
      headerRight={
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/marketing/ads">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ads Hub</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/ads/meta/settings">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
              <Settings className="w-3.5 h-3.5" />
              <span>Meta Settings</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing || loading || integrations.length === 0}
            className="gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing..." : "Sync Live Data"}</span>
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
      {/* ── Active Ad Account Banner ── */}
      {primaryIntegration && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-base shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  {primaryIntegration.name}
                </h3>
                <Badge variant="success" className="text-[10px] font-bold">
                  Connected & Active
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

      {/* ── Top Metric KPI Cards ── */}
      <MetaKpiCards kpis={kpis} currency={primaryIntegration?.currency || "INR"} />

      {/* ── Campaigns Table View ── */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">
              Live & Synced Campaigns
            </h2>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Real-time campaign performance across Facebook & Instagram with direct CRM lead acquisition stats.
            </p>
          </div>
        </div>

        <MetaCampaignTable
          campaigns={campaigns}
          loading={loading}
          onSync={handleSync}
          syncing={syncing}
          hasIntegration={integrations.length > 0}
          onConnectClick={() => setIsConnectModalOpen(true)}
        />
      </div>

      {/* ── Connect Ad Account Modal ── */}
      <MetaConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />
    </DashboardPageWrapper>
  );
}
