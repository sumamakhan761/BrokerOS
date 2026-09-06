'use client';

import React from 'react';
import { DollarSign, Users, Target, Eye } from 'lucide-react';

interface MasterAdsKpiCardsProps {
  totalCombinedSpend: number;
  totalCombinedLeads: number;
  blendedCpl: number;
  totalCombinedImpressions: number;
  campaignsCount: number;
  formatCurrency: (val: number, cur?: string) => string;
}

export const MasterAdsKpiCards: React.FC<MasterAdsKpiCardsProps> = ({
  totalCombinedSpend,
  totalCombinedLeads,
  blendedCpl,
  totalCombinedImpressions,
  campaignsCount,
  formatCurrency,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs relative overflow-hidden group">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
            Total Digital Ad Spend
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold shadow-xs">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
          {formatCurrency(totalCombinedSpend)}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[var(--text-tertiary)]">
          <span className="text-blue-600 font-bold">{campaignsCount} Campaigns</span>
          <span>across FB & IG</span>
        </div>
      </div>

      <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs relative overflow-hidden group">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
            Total CRM Leads Acquired
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold shadow-xs">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black tracking-tight text-emerald-600">
          {totalCombinedLeads.toLocaleString()}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[var(--text-tertiary)]">
          <span className="text-emerald-600 font-bold">Instant Forms & DM</span>
          <span>direct CRM sync</span>
        </div>
      </div>

      <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs relative overflow-hidden group">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
            Blended Cost Per Lead
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-extrabold shadow-xs">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
          {totalCombinedLeads > 0 ? formatCurrency(blendedCpl) : '—'}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[var(--text-tertiary)]">
          <span className="text-amber-600 font-bold">Optimal CPL</span>
          <span>cross-platform average</span>
        </div>
      </div>

      <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs relative overflow-hidden group">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
            Total Impressions
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-extrabold shadow-xs">
            <Eye className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
          {totalCombinedImpressions.toLocaleString()}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[var(--text-tertiary)]">
          <span className="text-purple-600 font-bold">Brand Exposure</span>
          <span>across all placements</span>
        </div>
      </div>
    </div>
  );
};
