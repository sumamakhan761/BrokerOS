'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, ArrowRight } from 'lucide-react';
import { Instagram } from '@/components/ui/InstagramIcon';
import { GoogleIcon } from '@/features/marketing/ads/google/components/GoogleIcon';
import { YouTubeIcon } from '@/features/marketing/ads/youtube/components/YouTubeIcon';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface AdsChannelsGridProps {
  metaCampaigns: any[];
  metaKpis: any;
  instagramCampaigns: any[];
  instagramKpis: any;
  googleCampaigns: any[];
  googleKpis: any;
  youtubeCampaigns: any[];
  youtubeKpis: any;
  formatCurrency: (val: number, cur?: string) => string;
}

export const AdsChannelsGrid: React.FC<AdsChannelsGridProps> = ({
  metaCampaigns,
  metaKpis,
  instagramCampaigns,
  instagramKpis,
  googleCampaigns,
  googleKpis,
  youtubeCampaigns,
  youtubeKpis,
  formatCurrency,
}) => {
  return (
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
                  {metaKpis.totalLeads > 0 ? formatCurrency(metaKpis.avgCpl || 0) : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/dashboard/marketing/ads/meta/settings"
              className="text-xs font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
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
                  {instagramKpis.totalLeads > 0 ? formatCurrency(instagramKpis.avgCpl || 0) : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/dashboard/marketing/ads/instagram/settings"
              className="text-xs font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
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
                  {googleKpis.totalConversions > 0 ? formatCurrency(googleKpis.avgCostPerConversion || 0) : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/dashboard/marketing/ads/google/settings"
              className="text-xs font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
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
            <Link
              href="/dashboard/marketing/ads/google/settings"
              className="text-xs font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
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
  );
};
