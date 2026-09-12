'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Scale } from 'lucide-react';
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper';
import { Button } from '@/components/ui/Button';
import {
  AdsComparisonStudio,
  NormalizedAdCampaign,
} from '@/features/marketing/ads/overview/AdsComparisonStudio';

export default function AdsComparePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<NormalizedAdCampaign[]>([]);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [metaRes, instagramRes, googleRes, youtubeRes] = await Promise.all([
        fetch(`${baseUrl}/api/marketing/ads/meta/campaigns`).catch(() => null),
        fetch(`${baseUrl}/api/marketing/ads/instagram/overview`).catch(() => null),
        fetch(`${baseUrl}/api/marketing/ads/google/campaigns`).catch(() => null),
        fetch(`${baseUrl}/api/marketing/ads/youtube/overview`).catch(() => null),
      ]);

      const normalized: NormalizedAdCampaign[] = [];

      // Meta / Facebook
      if (metaRes && metaRes.ok) {
        const mData = await metaRes.json();
        const items = mData?.items || [];
        for (const item of items) {
          const spend = Number(item.spend || 0);
          const leads = Number(item.leadsCount || 0);
          const clicks = Number(item.clicks || 0);
          const impressions = Number(item.impressions || 0);
          const cpl = leads > 0 ? spend / leads : Number(item.costPerLead || 0);
          const ctr = impressions > 0 ? (clicks / impressions) * 100 : Number(item.ctr || 0);
          const cpc = clicks > 0 ? spend / clicks : Number(item.cpc || 0);

          normalized.push({
            id: `meta-${item.id}`,
            name: item.name || 'Untitled Meta Campaign',
            platform: 'FACEBOOK',
            status: item.status || 'ACTIVE',
            spend,
            leadsCount: leads,
            costPerLead: cpl,
            clicks,
            ctr,
            cpc,
            impressions,
            reach: item.reach ? Number(item.reach) : undefined,
            currency: item.currency || 'INR',
          });
        }
      }

      // Instagram
      if (instagramRes && instagramRes.ok) {
        const igData = await instagramRes.json();
        const items = igData?.items || [];
        for (const item of items) {
          const spend = Number(item.spend || 0);
          const leads = Number(item.leadsCount || 0);
          const clicks = Number(item.clicks || 0);
          const impressions = Number(item.impressions || 0);
          const cpl = leads > 0 ? spend / leads : Number(item.costPerLead || 0);
          const ctr = impressions > 0 ? (clicks / impressions) * 100 : Number(item.ctr || 0);
          const cpc = clicks > 0 ? spend / clicks : Number(item.cpc || 0);

          normalized.push({
            id: `ig-${item.id}`,
            name: item.name || 'Untitled Instagram Campaign',
            platform: 'INSTAGRAM',
            status: item.status || 'ACTIVE',
            spend,
            leadsCount: leads,
            costPerLead: cpl,
            clicks,
            ctr,
            cpc,
            impressions,
            reach: item.reach ? Number(item.reach) : undefined,
            currency: item.currency || 'INR',
          });
        }
      }

      // Google
      if (googleRes && googleRes.ok) {
        const gData = await googleRes.json();
        const items = gData?.items || [];
        for (const item of items) {
          const spend = Number(item.spend || 0);
          const leads = Number(item.conversions || item.leadsCount || 0);
          const clicks = Number(item.clicks || 0);
          const impressions = Number(item.impressions || 0);
          const cpl = leads > 0 ? spend / leads : Number(item.costPerConversion || 0);
          const ctr = impressions > 0 ? (clicks / impressions) * 100 : Number(item.ctr || 0);
          const cpc = clicks > 0 ? spend / clicks : Number(item.cpc || 0);

          normalized.push({
            id: `google-${item.id}`,
            name: item.name || 'Untitled Google Campaign',
            platform: 'GOOGLE',
            status: item.status || 'ACTIVE',
            spend,
            leadsCount: leads,
            costPerLead: cpl,
            clicks,
            ctr,
            cpc,
            impressions,
            currency: item.currency || 'INR',
          });
        }
      }

      // YouTube
      if (youtubeRes && youtubeRes.ok) {
        const yData = await youtubeRes.json();
        const items = yData?.items || [];
        for (const item of items) {
          const spend = Number(item.spend || 0);
          const leads = Number(item.leadsCount || item.views || 0);
          const clicks = Number(item.clicks || 0);
          const impressions = Number(item.impressions || 0);
          const cpl = leads > 0 ? spend / leads : Number(item.cpv || 0);
          const ctr = impressions > 0 ? (clicks / impressions) * 100 : Number(item.ctr || 0);
          const cpc = clicks > 0 ? spend / clicks : Number(item.cpc || 0);

          normalized.push({
            id: `yt-${item.id}`,
            name: item.name || 'Untitled YouTube Video Campaign',
            platform: 'YOUTUBE',
            status: item.status || 'ACTIVE',
            spend,
            leadsCount: leads,
            costPerLead: cpl,
            clicks,
            ctr,
            cpc,
            impressions,
            currency: item.currency || 'INR',
          });
        }
      }

      // De-duplicate by ID
      const unique = Array.from(new Map(normalized.map((c) => [c.id, c])).values());
      setCampaigns(unique);
    } catch (err: any) {
      setError(err?.message || 'Failed to load campaigns for comparison');
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (val: number, cur: string = 'INR') => {
    if (cur === 'INR') {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${Math.round(val).toLocaleString('en-IN')}`;
    }
    return `$${Math.round(val).toLocaleString('en-US')}`;
  };

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      title="Campaign A/B Comparison Studio"
      subtitle="Head-to-head performance scorecard across Meta, Instagram, Google, and YouTube ad campaigns with automated winner badges."
      headerRight={
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/marketing/ads">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Ads Center</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload Campaigns</span>
          </Button>
        </div>
      }
    >
      <AdsComparisonStudio campaigns={campaigns} formatCurrency={formatCurrency} />
    </DashboardPageWrapper>
  );
}
