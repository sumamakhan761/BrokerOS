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
  Award,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GoogleIcon } from "@/features/marketing/ads/google/components/GoogleIcon";
import { GoogleKpiCards } from "@/features/marketing/ads/google/components/GoogleKpiCards";
import { GoogleQualityScoreWidget } from "@/features/marketing/ads/google/components/GoogleQualityScoreWidget";
import { GoogleCampaignTable } from "@/features/marketing/ads/google/components/GoogleCampaignTable";
import { GoogleConnectModal } from "@/features/marketing/ads/google/components/GoogleConnectModal";
import type {
  GoogleCampaignItem,
  GoogleKpiSummary,
  GoogleIntegrationItem,
} from "@/features/marketing/ads/google/types";

export default function GoogleAdsOverviewPage() {
  const [integrations, setIntegrations] = useState<GoogleIntegrationItem[]>([]);
  const [campaigns, setCampaigns] = useState<GoogleCampaignItem[]>([]);
  const [kpis, setKpis] = useState<GoogleKpiSummary>({
    totalSpend: 0,
    totalImpressions: 0,
    totalClicks: 0,
    totalConversions: 0,
    avgCostPerConversion: 0,
    avgCtr: 0,
    avgCpc: 0,
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
        fetch(`${baseUrl}/api/marketing/ads/google/integrations`),
        fetch(`${baseUrl}/api/marketing/ads/google/campaigns`),
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
      setError(err?.message || "Failed to load Google Ads data");
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
      const res = await fetch(`${baseUrl}/api/marketing/ads/google/integrations/${activeInt.id}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datePreset: "maximum" }),
      });

      if (res.ok) {
        await loadData();
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(
          errData?.message ||
          `Sync failed (HTTP ${res.status}). Verify your Developer Token and Google Ads permissions.`
        );
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
      title="Google Ads Engine"
      subtitle="Track Google Search & Performance Max campaigns, inspect keyword Quality Scores, monitor conversions & CPL, and ingest inbound Lead Form leads."
      headerRight={
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/marketing/ads">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ads Hub</span>
            </Button>
          </Link>
          <Link href="/dashboard/marketing/ads/google/settings">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
              <Settings className="w-3.5 h-3.5" />
              <span>Google Settings</span>
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
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-red-500 via-yellow-500 to-green-500" />
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-base shadow-xs">
              <GoogleIcon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                  {primaryIntegration.descriptiveName || primaryIntegration.name || "Google Ads Account"}
                </h3>
                <Badge variant="success" className="text-[10px] font-bold">
                  Connected & Active
                </Badge>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] font-mono mt-0.5">
                CID: {primaryIntegration.customerId} · Currency: {primaryIntegration.currency || "INR"}
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
      <GoogleKpiCards kpis={kpis} currency={primaryIntegration?.currency || "INR"} />

      {/* ── Quality Score Index Widget ── */}
      <GoogleQualityScoreWidget
        excellentCount={18}
        moderateCount={6}
        poorCount={2}
      />

      {/* ── Campaigns Table View ── */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">
              Live & Synced Campaigns
            </h2>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              High-intent Google Search and Performance Max campaigns with direct CRM lead acquisition metrics.
            </p>
          </div>
        </div>

        <GoogleCampaignTable
          campaigns={campaigns}
          currency={primaryIntegration?.currency || "INR"}
          loading={loading}
          onRefresh={loadData}
        />
      </div>

      {/* ── Connect Ad Account Modal ── */}
      <GoogleConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />
    </DashboardPageWrapper>
  );
}
