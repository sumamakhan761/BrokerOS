"use client";

import React from "react";
import {
  Send,
  CheckCircle2,
  Eye,
  MousePointer,
  AlertTriangle,
  UserX,
  ExternalLink,
  TrendingUp,
  Activity,
} from "lucide-react";
import type { CampaignAnalyticsSummary } from "@brokeros/types";

interface CampaignFunnelAnalyticsProps {
  analytics: CampaignAnalyticsSummary;
}

export function CampaignFunnelAnalytics({ analytics }: CampaignFunnelAnalyticsProps) {
  const steps = [
    {
      label: "1. Dispatched",
      count: analytics.sentCount,
      rate: "100%",
      subtext: "Total outbound recipients",
      color: "from-blue-500 to-indigo-600",
      icon: Send,
    },
    {
      label: "2. Delivered",
      count: analytics.deliveredCount,
      rate: `${analytics.deliveryRate}%`,
      subtext: `${analytics.bouncedCount} bounces filtered`,
      color: "from-sky-500 to-cyan-600",
      icon: CheckCircle2,
    },
    {
      label: "3. Opened",
      count: analytics.openedCount,
      rate: `${analytics.openRate}%`,
      subtext: "Unique inbox reads",
      color: "from-indigo-500 to-purple-600",
      icon: Eye,
    },
    {
      label: "4. Clicked",
      count: analytics.clickedCount,
      rate: `${analytics.clickRate}%`,
      subtext: "High-intent brochure clicks",
      color: "from-emerald-500 to-teal-600",
      icon: MousePointer,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── TOP KPI CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <span>Delivered Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.deliveryRate}%</p>
          <p className="text-xs text-slate-400 mt-1">
            {analytics.deliveredCount.toLocaleString()} of {analytics.sentCount.toLocaleString()} emails
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <span>Open Rate</span>
            <Eye className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.openRate}%</p>
          <p className="text-xs text-slate-400 mt-1">
            {analytics.openedCount.toLocaleString()} unique opens
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <span>Click-Through Rate</span>
            <MousePointer className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.clickRate}%</p>
          <p className="text-xs text-slate-400 mt-1">
            {analytics.clickedCount.toLocaleString()} link clicks
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <span>Click-to-Open (CTOR)</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.clickToOpenRate}%</p>
          <p className="text-xs text-slate-400 mt-1">Content resonance index</p>
        </div>
      </div>

      {/* ── VISUAL DELIVERY FUNNEL ── */}
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-500" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Marketing Conversion Funnel</h4>
          </div>
          <span className="text-xs text-slate-400">Real-time event stream</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;

            return (
              <div
                key={step.label}
                className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{step.label}</span>
                  <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-700 shadow-xs">
                    <Icon className="w-3.5 h-3.5 text-slate-700 dark:text-zinc-200" />
                  </div>
                </div>

                <p className="text-2xl font-black text-slate-900 dark:text-white mb-0.5">
                  {step.count.toLocaleString()}
                </p>

                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60">
                  <span className="font-bold text-sky-600 dark:text-sky-400">{step.rate}</span>
                  <span className="text-[11px] text-slate-400 truncate max-w-[120px]">{step.subtext}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── TOP CLICKED LINKS TABLE ── */}
      {analytics.topClickedLinks?.length > 0 && (
        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Top Clicked Links</h4>
            <span className="text-xs text-slate-400">CTA Engagement Breakdown</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {analytics.topClickedLinks.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-slate-700 dark:text-zinc-300 truncate">{item.url}</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full shrink-0">
                  {item.clicks.toLocaleString()} clicks
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
