'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  RefreshCw,
  Settings,
  ArrowLeft,
  Video,
  Play,
  Flame,
} from 'lucide-react';
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { YouTubeIcon } from '@/features/marketing/ads/youtube/components/YouTubeIcon';
import { YouTubeKpiCards } from '@/features/marketing/ads/youtube/components/YouTubeKpiCards';
import { YouTubeAudienceRetentionWidget } from '@/features/marketing/ads/youtube/components/YouTubeAudienceRetentionWidget';
import { YouTubeCampaignTable } from '@/features/marketing/ads/youtube/components/YouTubeCampaignTable';
import type {
  YouTubeCampaignItem,
  YouTubeKpiSummary,
} from '@/features/marketing/ads/youtube/types';

export default function YouTubeAdsOverviewPage() {
  const [integration, setIntegration] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<YouTubeCampaignItem[]>([]);
  const [kpis, setKpis] = useState<YouTubeKpiSummary>({
    totalSpend: 0,
    totalViews: 0,
    totalImpressions: 0,
    avgCpv: 0,
    avgViewRate: 0,
    totalLeads: 0,
    avgCostPerLead: 0,
    avgQuartile100Rate: 0,
    activeCampaignsCount: 0,
    totalCampaignsCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [integrationsRes, overviewRes] = await Promise.all([
        fetch(`${baseUrl}/api/marketing/ads/google/integrations`),
        fetch(`${baseUrl}/api/marketing/ads/youtube/overview`),
      ]);

      if (integrationsRes.ok) {
        const intData = await integrationsRes.json();
        if (Array.isArray(intData) && intData.length > 0) {
          setIntegration(intData[0]);
        }
      }

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setCampaigns(data?.items || []);
        if (data?.kpis) {
          setKpis(data.kpis);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load YouTube Ads data');
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSync = async () => {
    if (!integration) {
      setError('Please connect your Google Ads account first.');
      return;
    }

    try {
      setSyncing(true);
      const res = await fetch(`${baseUrl}/api/marketing/ads/youtube/integrations/${integration.id}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datePreset: 'maximum' }),
      });

      if (res.ok) {
        await loadData();
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData?.message || 'Sync failed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      title="YouTube Video Ads"
      subtitle="Monitor 4K property walkthroughs, drone tour views, CPVs, and video lead conversions."
    >
      <div className="space-y-6">
        {/* Navigation & Controls Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/marketing/ads">
              <Button variant="outline" size="sm" className="rounded-xl h-9 px-3 gap-1.5 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" />
                All Ads Channels
              </Button>
            </Link>

            {integration ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80">
                <div className="w-5 h-5 rounded-lg bg-rose-50 flex items-center justify-center">
                  <YouTubeIcon size={14} />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                  <span>{integration.name || 'Google & YouTube Connected'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-emerald-700 font-mono">
                    CID: {integration.customerId}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold">
                <span>Google Ads Account Not Connected</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing || loading}
              className="rounded-xl h-9 px-3.5 gap-2 text-xs font-bold shadow-xs bg-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-rose-500' : ''}`} />
              {syncing ? 'Syncing Video Ads...' : 'Sync Live Data'}
            </Button>

            <Link href="/dashboard/marketing/ads/google/settings">
              <Button variant="outline" size="sm" className="rounded-xl h-9 px-3 gap-1.5 text-xs">
                <Settings className="w-3.5 h-3.5" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold underline ml-2">
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Video KPI Cards */}
        <YouTubeKpiCards kpis={kpis} currency={integration?.currency || 'INR'} />

        {/* 2. Video Retention Funnel Widget */}
        <YouTubeAudienceRetentionWidget totalViews={kpis.totalViews} />

        {/* 3. Video Campaigns Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                Video Walkthrough Campaigns
              </h3>
              <Badge variant="default" className="text-xs font-mono">
                {campaigns.length}
              </Badge>
            </div>
          </div>

          <YouTubeCampaignTable
            campaigns={campaigns}
            currency={integration?.currency || 'INR'}
            loading={loading}
            onRefresh={loadData}
          />
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
