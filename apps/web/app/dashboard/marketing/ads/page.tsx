'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  Plus,
  ArrowLeft,
  Scale,
} from 'lucide-react';
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper';
import { Button } from '@/components/ui/Button';
import { MetaConnectModal } from '@/features/marketing/ads/meta/components/MetaConnectModal';
import { MasterAdsKpiCards } from '@/features/marketing/ads/overview/MasterAdsKpiCards';
import { AdsChannelsGrid } from '@/features/marketing/ads/overview/AdsChannelsGrid';
import { AdsCampaignsTable } from '@/features/marketing/ads/overview/AdsCampaignsTable';

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

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';

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
      setError(err?.message || 'Failed to load master ads analytics');
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
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ datePreset: 'maximum' }),
        }),
        fetch(`${baseUrl}/api/marketing/ads/instagram/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ datePreset: 'maximum' }),
        }),
      ]);

      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Sync operation failed');
    } finally {
      setSyncing(false);
    }
  };

  const formatCurrency = (val: number, cur: string = 'INR') => {
    if (cur === 'INR') {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${Math.round(val).toLocaleString('en-IN')}`;
    }
    return `$${Math.round(val).toLocaleString('en-US')}`;
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
    ...metaCampaigns.map((c) => ({ ...c, platform: 'FACEBOOK' })),
    ...instagramCampaigns.map((c) => ({ ...c, platform: 'INSTAGRAM' })),
    ...googleCampaigns.map((c) => ({ ...c, platform: 'GOOGLE' })),
    ...youtubeCampaigns.map((c) => ({ ...c, platform: 'YOUTUBE' })),
  ];

  // Remove duplicates by ID
  const uniqueCampaigns = Array.from(
    new Map(combinedCampaigns.map((item) => [item.id, item])).values(),
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
          <Link href="/dashboard/marketing/ads/compare">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800 hover:bg-purple-50 border-purple-200"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>A/B Compare</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncAll}
            disabled={syncing || loading || integrations.length === 0}
            className="gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing All...' : 'Sync All Live Data'}</span>
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
      {/* Top Blended Cross-Platform KPI Cards */}
      <MasterAdsKpiCards
        totalCombinedSpend={totalCombinedSpend}
        totalCombinedLeads={totalCombinedLeads}
        blendedCpl={blendedCpl}
        totalCombinedImpressions={totalCombinedImpressions}
        campaignsCount={metaCampaigns.length + instagramCampaigns.length}
        formatCurrency={formatCurrency}
      />

      {/* Multi-Platform Launchpad Cards */}
      <AdsChannelsGrid
        metaCampaigns={metaCampaigns}
        metaKpis={metaKpis}
        instagramCampaigns={instagramCampaigns}
        instagramKpis={instagramKpis}
        googleCampaigns={googleCampaigns}
        googleKpis={googleKpis}
        youtubeCampaigns={youtubeCampaigns}
        youtubeKpis={youtubeKpis}
        formatCurrency={formatCurrency}
      />

      {/* Unified Cross-Platform Campaigns Feed */}
      <AdsCampaignsTable
        uniqueCampaigns={uniqueCampaigns}
        formatCurrency={formatCurrency}
      />

      <MetaConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={loadData}
      />
    </DashboardPageWrapper>
  );
}
