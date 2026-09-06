// ============================================================================
// BrokerOS — WhatsApp Pipeline Analytics Summary
// ============================================================================

'use client';

import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Award,
  BarChart3,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WhatsAppDealItem } from './DealCard';
import type { PipelineStageItem } from './PipelineBoard';

interface PipelineAnalyticsProps {
  stages: PipelineStageItem[];
  deals: WhatsAppDealItem[];
}

function formatInr(val: number) {
  if (!val) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
}

export function PipelineAnalytics({ stages, deals }: PipelineAnalyticsProps) {
  const totalDeals = deals.length;
  const activeDeals = deals.filter((d) => d.status === 'active');
  const wonDeals = deals.filter((d) => d.status === 'won');
  const lostDeals = deals.filter((d) => d.status === 'lost');

  const totalValue = deals.reduce((sum, d) => sum + Number(d.value || 0), 0);
  const activeValue = activeDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
  const wonValue = wonDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);

  const winRate = totalDeals > 0 ? Math.round((wonDeals.length / totalDeals) * 100) : 0;
  const avgDealSize = totalDeals > 0 ? Math.round(totalValue / totalDeals) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Active Pipeline Value */}
      <div className="rounded-2xl border border-border-default bg-bg-surface p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-text-muted">Total Active Pipeline</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-xl font-bold text-text-primary">{formatInr(activeValue)}</p>
        <p className="text-[11px] text-text-muted mt-0.5">{activeDeals.length} active deals</p>
      </div>

      {/* Won Revenue */}
      <div className="rounded-2xl border border-border-default bg-bg-surface p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-text-muted">Closed Won Revenue</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
            <Award className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-xl font-bold text-emerald-600">{formatInr(wonValue)}</p>
        <p className="text-[11px] text-text-muted mt-0.5">{wonDeals.length} deals won</p>
      </div>

      {/* Win Rate */}
      <div className="rounded-2xl border border-border-default bg-bg-surface p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-text-muted">Conversion Win Rate</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
            <BarChart3 className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-xl font-bold text-text-primary">{winRate}%</p>
        <p className="text-[11px] text-text-muted mt-0.5">{lostDeals.length} lost / dropped</p>
      </div>

      {/* Average Deal Size */}
      <div className="rounded-2xl border border-border-default bg-bg-surface p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-text-muted">Average Deal Size</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
            <Layers className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-xl font-bold text-text-primary">{formatInr(avgDealSize)}</p>
        <p className="text-[11px] text-text-muted mt-0.5">Across all inquiries</p>
      </div>
    </div>
  );
}
