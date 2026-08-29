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
} from "lucide-react";
import type { CampaignAnalyticsSummary } from "@brokeros/types";
import { Badge } from "@/components/ui/Badge";

export interface EmailFunnelAnalyticsProps {
  analytics: CampaignAnalyticsSummary;
}

export function EmailFunnelAnalytics({ analytics }: EmailFunnelAnalyticsProps) {
  const steps = [
    {
      label: "1. Dispatched",
      count: analytics.sentCount,
      rate: "100%",
      subtext: "Total outbound recipients",
      color: "oklch(0.535 0.235 275)",
      icon: Send,
    },
    {
      label: "2. Delivered",
      count: analytics.deliveredCount,
      rate: `${analytics.deliveryRate}%`,
      subtext: `${analytics.bouncedCount} bounces filtered`,
      color: "oklch(0.42 0.16 145)",
      icon: CheckCircle2,
    },
    {
      label: "3. Opened",
      count: analytics.openedCount,
      rate: `${analytics.openRate}%`,
      subtext: "Unique inbox reads",
      color: "oklch(0.48 0.18 240)",
      icon: Eye,
    },
    {
      label: "4. Clicked",
      count: analytics.clickedCount,
      rate: `${analytics.clickRate}%`,
      subtext: "High-intent brochure clicks",
      color: "oklch(0.50 0.17 80)",
      icon: MousePointer,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── TOP KPI CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] mb-1">
            <span>Delivered Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-[var(--text-primary)] tabular-nums">{analytics.deliveryRate}%</p>
          <p className="text-[11px] font-medium text-[var(--text-muted)] mt-1">
            {analytics.deliveredCount.toLocaleString()} of {analytics.sentCount.toLocaleString()} emails
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] mb-1">
            <span>Open Rate</span>
            <Eye className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-extrabold text-[var(--text-primary)] tabular-nums">{analytics.openRate}%</p>
          <p className="text-[11px] font-medium text-[var(--text-muted)] mt-1">
            {analytics.openedCount.toLocaleString()} unique opens
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] mb-1">
            <span>Click-Through Rate</span>
            <MousePointer className="w-4 h-4 text-[var(--brand-600)]" />
          </div>
          <p className="text-2xl font-extrabold text-[var(--text-primary)] tabular-nums">{analytics.clickRate}%</p>
          <p className="text-[11px] font-medium text-[var(--text-muted)] mt-1">
            {analytics.clickedCount.toLocaleString()} link clicks
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] mb-1">
            <span>Click-to-Open (CTOR)</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-[var(--text-primary)] tabular-nums">{analytics.clickToOpenRate}%</p>
          <p className="text-[11px] font-medium text-[var(--text-muted)] mt-1">Content resonance index</p>
        </div>
      </div>

      {/* ── VISUAL FUNNEL PIPELINE ── */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)] mb-0.5">Campaign Conversion Funnel</h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">Step-by-step audience engagement pipeline</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.label}
                className="relative p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold text-[var(--text-tertiary)] uppercase tracking-wider">{st.label}</span>
                    <Icon className="w-4 h-4" style={{ color: st.color }} />
                  </div>
                  <div className="text-xl font-extrabold text-[var(--text-primary)] tabular-nums">{st.count.toLocaleString()}</div>
                  <div className="text-xs font-bold mt-0.5" style={{ color: st.color }}>{st.rate} conversion</div>
                </div>
                <p className="text-[10px] font-medium text-[var(--text-muted)] mt-3 pt-2 border-t border-slate-200/70">{st.subtext}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── TOP CLICKED LINKS & HYGIENE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Clicked Links */}
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Top Clicked Project Assets</h3>
          {analytics.topClickedLinks.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">No link clicks recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {analytics.topClickedLinks.map((link, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80"
                >
                  <div className="flex items-center gap-2 overflow-hidden mr-3">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-bold text-[var(--text-primary)] truncate">{link.url}</span>
                  </div>
                  <Badge variant="default" className="text-xs font-extrabold shrink-0 tabular-nums">
                    {link.clicks} clicks
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email Health & Bounce Stats */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Audience Hygiene</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200/80">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-bold text-rose-900">Bounced Emails</span>
              </div>
              <span className="text-xs font-extrabold text-rose-900 tabular-nums">{analytics.bouncedCount} ({analytics.bounceRate}%)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-200/80">
              <div className="flex items-center gap-2">
                <UserX className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-800">Unsubscribes</span>
              </div>
              <span className="text-xs font-extrabold text-slate-800 tabular-nums">{analytics.unsubscribedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
