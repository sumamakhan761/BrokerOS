'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, ArrowRight, Scale } from 'lucide-react';
import { Instagram } from '@/components/ui/InstagramIcon';
import { GoogleIcon } from '@/features/marketing/ads/google/components/GoogleIcon';
import { YouTubeIcon } from '@/features/marketing/ads/youtube/components/YouTubeIcon';
import { Button } from '@/components/ui/Button';

interface AdsCampaignsTableProps {
  uniqueCampaigns: any[];
  formatCurrency: (val: number, cur?: string) => string;
}

export const AdsCampaignsTable: React.FC<AdsCampaignsTableProps> = ({
  uniqueCampaigns,
  formatCurrency,
}) => {
  return (
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
        <Link href="/dashboard/marketing/ads/compare">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800 hover:bg-purple-50 border-purple-200"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>A/B Compare Campaigns</span>
          </Button>
        </Link>
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
                    <span>No digital ad campaigns synced yet. Click &quot;Connect Ad Account&quot; to begin.</span>
                  </td>
                </tr>
              ) : (
                uniqueCampaigns.map((camp) => {
                  const isYouTube = camp.platform === 'YOUTUBE';
                  const isIg = camp.platform === 'INSTAGRAM';
                  const isGoogle = camp.platform === 'GOOGLE';
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
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            camp.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              camp.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
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
                        {camp.leadsCount > 0 ? formatCurrency(camp.costPerLead || 0) : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                        {camp.ctr ? `${camp.ctr.toFixed(1)}%` : '0%'}
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
  );
};
