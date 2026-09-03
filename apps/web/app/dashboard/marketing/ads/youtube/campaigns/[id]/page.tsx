'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  Target,
  DollarSign,
  TrendingUp,
  Users,
  Video,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Eye,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { YouTubeIcon } from '@/features/marketing/ads/youtube/components/YouTubeIcon';
import { YouTubeAudienceRetentionWidget } from '@/features/marketing/ads/youtube/components/YouTubeAudienceRetentionWidget';
import { YouTubeAcquiredLeadsTable } from '@/features/marketing/ads/youtube/components/YouTubeAcquiredLeadsTable';
import { YouTubeVideoPlayerModal } from '@/features/marketing/ads/youtube/components/YouTubeVideoPlayerModal';
import type {
  YouTubeCampaignItem,
  YouTubeRetentionProfile,
  YouTubeAcquiredLead,
} from '@/features/marketing/ads/youtube/types';
import { YOUTUBE_AD_FORMAT_CONFIG } from '@brokeros/constants';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function YouTubeCampaignDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const campaignId = resolvedParams.id;

  const [activeTab, setActiveTab] = useState<'RETENTION' | 'LEADS'>('RETENTION');
  const [campaign, setCampaign] = useState<any>(null);
  const [retention, setRetention] = useState<YouTubeRetentionProfile>({
    quartile25: 68.5,
    quartile50: 45.2,
    quartile75: 31.0,
    quartile100: 19.4,
  });
  const [acquiredLeads, setAcquiredLeads] = useState<YouTubeAcquiredLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';

  useEffect(() => {
    async function loadDetails() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${baseUrl}/api/marketing/ads/youtube/campaigns/${campaignId}`);
        if (!res.ok) {
          throw new Error(`Failed to load campaign (${res.status})`);
        }

        const data = await res.json();
        if (data?.campaign) {
          setCampaign(data.campaign);
          if (data.retention) setRetention(data.retention);
          setAcquiredLeads(data.acquiredLeads || []);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load campaign');
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [baseUrl, campaignId]);

  const formatCurrency = (val: number, cur: string = 'INR') => {
    if (cur === 'INR' || cur === '₹') {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${Math.round(val).toLocaleString('en-IN')}`;
    }
    return `$${Math.round(val).toLocaleString('en-US')}`;
  };

  const formatMeta =
    YOUTUBE_AD_FORMAT_CONFIG[
      (campaign?.format as keyof typeof YOUTUBE_AD_FORMAT_CONFIG) || 'IN_STREAM_SKIPPABLE'
    ];

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      title={campaign?.name || 'YouTube Video Campaign'}
      subtitle={`ID: ${campaignId} · Format: ${formatMeta?.label || 'Video Walkthrough'}`}
    >
      <div className="space-y-6">
        {/* Navigation Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-tertiary)]">
            <Link
              href="/dashboard/marketing/ads/youtube"
              className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              YouTube Video Ads
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[var(--text-primary)] font-bold truncate max-w-xs">
              {campaign?.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlayerOpen(true)}
              className="rounded-xl h-9 px-3 gap-1.5 text-xs font-bold text-rose-600 border-rose-200/80 bg-rose-50/50 hover:bg-rose-100"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Watch Video Ad
            </Button>
          </div>
        </div>

        {/* Campaign Hero Card */}
        {campaign && (
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => setIsPlayerOpen(true)}
                  className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center shrink-0 shadow-xs transition-all hover:scale-105"
                  title="Play Video Ad"
                >
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </button>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">
                      {campaign.name}
                    </h2>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${formatMeta?.bgClass || 'bg-slate-50'}`}>
                      {formatMeta?.badge || 'Video Walkthrough'}
                    </span>
                    <Badge variant="default" className="text-[10px] font-mono">
                      {campaign.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">
                    Connected Google CID: {campaign.formattedCustomerId || campaign.integration?.customerId}
                  </p>
                </div>
              </div>

              {/* Spend & Budget stats */}
              <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                    Daily Budget
                  </span>
                  <span className="text-base font-black text-slate-900">
                    {campaign.dailyBudget ? formatCurrency(campaign.dailyBudget) + '/day' : '—'}
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                    Total Spend
                  </span>
                  <span className="text-base font-black text-rose-600">
                    {formatCurrency(campaign.spend)}
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Mini Stat Blocks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                <span className="text-[11px] font-semibold text-[var(--text-tertiary)] block">
                  Total Views & VTR
                </span>
                <span className="text-lg font-black text-slate-900">
                  {(campaign.views || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] font-bold text-slate-500 block mt-0.5">
                  {campaign.viewRate || 0}% View Rate
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                <span className="text-[11px] font-semibold text-[var(--text-tertiary)] block">
                  Avg Cost / View
                </span>
                <span className="text-lg font-black text-blue-600">
                  ₹{(campaign.cpv || 0).toFixed(2)}
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)] block mt-0.5">
                  Cost per video view
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                <span className="text-[11px] font-semibold text-[var(--text-tertiary)] block">
                  Inbound Video Leads
                </span>
                <span className="text-lg font-black text-emerald-600">
                  {acquiredLeads.length}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">
                  Direct CRM Sync
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                <span className="text-[11px] font-semibold text-[var(--text-tertiary)] block">
                  100% Tour Completed
                </span>
                <span className="text-lg font-black text-purple-600">
                  {retention.quartile100}%
                </span>
                <span className="text-[10px] text-purple-700 font-bold block mt-0.5">
                  High-intent buyers
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('RETENTION')}
            className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'RETENTION'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Video className="w-4 h-4" />
            Retention & Creative Analysis
          </button>

          <button
            onClick={() => setActiveTab('LEADS')}
            className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'LEADS'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Users className="w-4 h-4" />
            Inbound Video Leads
            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-mono text-slate-700">
              {acquiredLeads.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'RETENTION' && (
          <div className="space-y-6">
            <YouTubeAudienceRetentionWidget retention={retention} totalViews={campaign?.views} />

            {/* Video Optimization Best Practices Card */}
            <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl shadow-sm">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-extrabold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                Real Estate Video Conversion Optimization
              </div>
              <h4 className="text-base font-black mb-1">
                How to boost "Book Site Visit" conversions on YouTube
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                For 4K luxury property walkthroughs, place your floor plan and pricing reveal between 0:45s and 1:15s where retention is peak (45.2%). Add an interactive lead form banner overlay to capture buyer inquiries directly inside YouTube.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'LEADS' && (
          <YouTubeAcquiredLeadsTable leads={acquiredLeads} />
        )}
      </div>

      {/* Video Player Modal */}
      <YouTubeVideoPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        campaignName={campaign?.name || 'Property Walkthrough'}
        videoId={campaign?.videoId || 'dQw4w9WgXcQ'}
        format={formatMeta?.label}
        views={campaign?.views}
        spend={campaign?.spend}
      />
    </DashboardPageWrapper>
  );
}
