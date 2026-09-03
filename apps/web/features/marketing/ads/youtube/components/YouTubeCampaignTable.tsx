'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ArrowRight,
  PauseCircle,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { YouTubeCampaignItem } from '../types';
import { YOUTUBE_AD_FORMAT_CONFIG } from '@brokeros/constants';
import { YouTubeIcon } from './YouTubeIcon';
import { YouTubeVideoPlayerModal } from './YouTubeVideoPlayerModal';

interface YouTubeCampaignTableProps {
  campaigns: YouTubeCampaignItem[];
  currency?: string;
  loading?: boolean;
  onRefresh?: () => void;
}

export function YouTubeCampaignTable({
  campaigns,
  currency = 'INR',
  loading = false,
}: YouTubeCampaignTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Video modal state
  const [selectedVideo, setSelectedVideo] = useState<{
    isOpen: boolean;
    name: string;
    videoId: string;
    format: string;
    views: number;
    spend: number;
  }>({
    isOpen: false,
    name: '',
    videoId: '',
    format: '',
    views: 0,
    spend: 0,
  });

  const filtered = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat = formatFilter === 'ALL' || c.format === formatFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesFormat && matchesStatus;
  });

  const formatCurrency = (val: number) => {
    if (currency === 'INR' || currency === '₹') {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${Math.round(val).toLocaleString('en-IN')}`;
    }
    return `$${Math.round(val).toLocaleString('en-US')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ENABLED':
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
            <PauseCircle className="w-3.5 h-3.5" />
            Paused
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Search YouTube campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-500)]/20 focus:border-[var(--brand-500)] transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Format Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[var(--text-tertiary)]">Format:</span>
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-[var(--text-primary)] focus:outline-hidden"
              >
                <option value="ALL">All Formats</option>
                <option value="IN_STREAM_SKIPPABLE">Skippable In-Stream</option>
                <option value="IN_FEED_VIDEO">In-Feed Discovery</option>
                <option value="SHORTS">YouTube Shorts</option>
                <option value="BUMPER">Bumper (6s)</option>
                <option value="DEMAND_GEN">Demand Gen</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[var(--text-tertiary)]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-bold bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-[var(--text-primary)] focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="ENABLED">Active Only</option>
                <option value="PAUSED">Paused Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-primary)]">
            <thead className="bg-slate-50/80 text-[var(--text-tertiary)] font-bold uppercase tracking-wider border-b border-slate-100 text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Video Campaign</th>
                <th className="py-3.5 px-4">Format</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Video Views & VTR</th>
                <th className="py-3.5 px-4 text-right">Avg CPV</th>
                <th className="py-3.5 px-4 text-right">Leads</th>
                <th className="py-3.5 px-4 text-right">Daily Budget</th>
                <th className="py-3.5 px-4 text-right">Total Spend</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[var(--text-tertiary)]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                        <YouTubeIcon size={24} />
                      </div>
                      <span className="text-sm font-bold text-[var(--text-primary)]">
                        No YouTube Video Campaigns Found
                      </span>
                      <p className="text-xs text-[var(--text-tertiary)] max-w-sm">
                        Create a Video campaign in your Google Ads account to showcase 4K property walkthroughs & drone tours.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const formatMeta = YOUTUBE_AD_FORMAT_CONFIG[c.format] || YOUTUBE_AD_FORMAT_CONFIG.IN_STREAM_SKIPPABLE;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              setSelectedVideo({
                                isOpen: true,
                                name: c.name,
                                videoId: c.videoId || 'dQw4w9WgXcQ',
                                format: formatMeta.label,
                                views: c.views,
                                spend: c.spend,
                              })
                            }
                            className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-all group-hover:scale-105 shrink-0 shadow-xs"
                            title="Play Video Walkthrough"
                          >
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </button>
                          <div className="min-w-0">
                            <Link
                              href={`/dashboard/marketing/ads/youtube/campaigns/${c.id}`}
                              className="font-extrabold text-slate-900 hover:text-[var(--brand-600)] transition-colors line-clamp-1 block"
                            >
                              {c.name}
                            </Link>
                            <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                              ID: {c.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Format Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${formatMeta.bgClass}`}>
                          {formatMeta.badge}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">{getStatusBadge(c.status)}</td>

                      {/* Video Views & VTR */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-black text-slate-900 block">
                          {c.views.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {c.viewRate}% VTR
                        </span>
                      </td>

                      {/* CPV */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-extrabold text-blue-700">
                          ₹{c.cpv.toFixed(2)}
                        </span>
                      </td>

                      {/* Leads */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-black text-emerald-700 block">
                          {c.leads.toLocaleString('en-IN')}
                        </span>
                        {c.leads > 0 && (
                          <span className="text-[10px] text-[var(--text-tertiary)]">
                            ₹{Math.round(c.costPerLead)}/lead
                          </span>
                        )}
                      </td>

                      {/* Daily Budget */}
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        {c.dailyBudget ? formatCurrency(c.dailyBudget) + '/day' : '—'}
                      </td>

                      {/* Total Spend */}
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        {formatCurrency(c.spend)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <Link href={`/dashboard/marketing/ads/youtube/campaigns/${c.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 px-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900">
                            Inspect
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
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

      {/* Video Player Modal */}
      <YouTubeVideoPlayerModal
        isOpen={selectedVideo.isOpen}
        onClose={() => setSelectedVideo((prev) => ({ ...prev, isOpen: false }))}
        campaignName={selectedVideo.name}
        videoId={selectedVideo.videoId}
        format={selectedVideo.format}
        views={selectedVideo.views}
        spend={selectedVideo.spend}
      />
    </>
  );
}
