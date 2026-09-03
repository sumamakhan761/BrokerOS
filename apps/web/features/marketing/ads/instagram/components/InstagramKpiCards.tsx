"use client";

import React from "react";
import {
  DollarSign,
  Users,
  Target,
  Eye,
  TrendingUp,
  Sparkles,
  Video,
  Layers,
} from "lucide-react";
import type { InstagramCampaignSummaryKpis } from "../types";

interface InstagramKpiCardsProps {
  kpis: InstagramCampaignSummaryKpis;
  currency?: string;
}

export function InstagramKpiCards({
  kpis,
  currency = "INR",
}: InstagramKpiCardsProps) {
  const formatCurrency = (val: number) => {
    if (currency === "INR") {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${Math.round(val).toLocaleString("en-IN")}`;
    }
    return `$${Math.round(val).toLocaleString("en-US")}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* ── 1. Total Instagram Spend ── */}
      <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs relative overflow-hidden group hover:border-pink-300 transition-all">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
            Total IG Ad Spend
          </span>
          <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-extrabold shadow-xs">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
          {formatCurrency(kpis.totalSpend)}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[var(--text-tertiary)]">
          <span className="text-emerald-600 font-bold">
            {kpis.activeCampaignsCount} Active
          </span>
          <span>across Reels, Stories & Feed</span>
        </div>
      </div>

      {/* ── 2. Total Inbound Leads ── */}
      <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs relative overflow-hidden group hover:border-purple-300 transition-all">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
            Instagram Leads
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-extrabold shadow-xs">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black tracking-tight text-emerald-600">
          {kpis.totalLeads.toLocaleString()}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[var(--text-tertiary)]">
          <span className="text-purple-600 font-bold">Instant Forms & DM</span>
          <span>direct CRM sync</span>
        </div>
      </div>

      {/* ── 3. Average Cost Per Lead (CPL) ── */}
      <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-pink-500 to-amber-500" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
            Average IG CPL
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-extrabold shadow-xs">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
          {kpis.totalLeads > 0 ? formatCurrency(kpis.avgCpl) : "—"}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[var(--text-tertiary)]">
          <span className="text-amber-600 font-bold">{kpis.avgCtr}% CTR</span>
          <span>blended conversion rate</span>
        </div>
      </div>

      {/* ── 4. Reels Views & Impressions ── */}
      <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs relative overflow-hidden group hover:border-rose-300 transition-all">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
            Reels Views & Reach
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-extrabold shadow-xs">
            <Video className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
          {(kpis.reelsViews || Math.round(kpis.totalImpressions * 0.45)).toLocaleString()}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[var(--text-tertiary)]">
          <span className="text-rose-600 font-bold">
            {kpis.totalReach.toLocaleString()}
          </span>
          <span>unique accounts reached</span>
        </div>
      </div>
    </div>
  );
}
