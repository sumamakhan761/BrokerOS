'use client';

import React from 'react';
import {
  Play,
  TrendingUp,
  Target,
  DollarSign,
  Eye,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import type { YouTubeKpiSummary } from '../types';

interface YouTubeKpiCardsProps {
  kpis: YouTubeKpiSummary;
  currency?: string;
}

export function YouTubeKpiCards({ kpis, currency = 'INR' }: YouTubeKpiCardsProps) {
  const formatCurrency = (val: number) => {
    if (currency === 'INR' || currency === '₹') {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${Math.round(val).toLocaleString('en-IN')}`;
    }
    return `$${Math.round(val).toLocaleString('en-US')}`;
  };

  const cards = [
    {
      title: 'YouTube Ad Spend',
      value: formatCurrency(kpis.totalSpend || 0),
      subtitle: `${kpis.activeCampaignsCount} active / ${kpis.totalCampaignsCount} video campaigns`,
      icon: DollarSign,
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      accentBorder: 'hover:border-rose-300',
    },
    {
      title: 'Total Video Views',
      value: (kpis.totalViews || 0).toLocaleString('en-IN'),
      subtitle: `${kpis.avgViewRate || 0}% View-Through Rate (VTR)`,
      icon: Play,
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      accentBorder: 'hover:border-red-300',
    },
    {
      title: 'Avg Cost / View (CPV)',
      value: `₹${(kpis.avgCpv || 0).toFixed(2)}`,
      subtitle: kpis.totalViews > 0 ? 'Benchmark: ₹0.40 - ₹0.80' : 'Awaiting video views',
      icon: TrendingUp,
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      accentBorder: 'hover:border-blue-300',
    },
    {
      title: 'Video Inbound Leads',
      value: (kpis.totalLeads || 0).toLocaleString('en-IN'),
      subtitle: kpis.totalLeads > 0 ? `Avg CPL: ${formatCurrency(kpis.avgCostPerLead)}` : 'YouTube Lead Form / CTA',
      icon: Target,
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      accentBorder: 'hover:border-emerald-300',
    },
    {
      title: '100% Full Tour Completion',
      value: `${kpis.avgQuartile100Rate || 0}%`,
      subtitle: 'Ultra-hot prospects watched full tour',
      icon: CheckCircle2,
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      accentBorder: 'hover:border-purple-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:shadow-md ${card.accentBorder} transition-all relative overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider truncate">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.bgColor} ${card.textColor} shadow-xs`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              {card.value}
            </div>
            <div className="text-xs font-medium text-[var(--text-secondary)] mt-1 truncate">
              {card.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
}
