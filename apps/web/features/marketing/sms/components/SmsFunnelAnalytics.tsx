"use client";

import React from "react";
import {
  Send,
  CheckCircle2,
  MousePointerClick,
  AlertTriangle,
  Layers,
  ExternalLink,
  Smartphone,
  ShieldAlert,
} from "lucide-react";
import type { SmsCampaignAnalyticsSummary } from "@brokeros/types";
import { SMS_PROVIDERS } from "@brokeros/constants";
import { Badge } from "@/components/ui/Badge";

export interface SmsFunnelAnalyticsProps {
  analytics: SmsCampaignAnalyticsSummary | any;
}

export function SmsFunnelAnalytics({ analytics }: SmsFunnelAnalyticsProps) {
  const sent = analytics.sentCount || 0;
  const delivered = analytics.deliveredCount || 0;
  const clicked = analytics.clickedCount || 0;
  const failed = analytics.failedCount || 0;

  const deliveryRate =
    analytics.deliveryRate !== undefined
      ? analytics.deliveryRate
      : sent > 0
      ? Number(((delivered / sent) * 100).toFixed(1))
      : 0;
  const clickRate =
    analytics.clickRate !== undefined
      ? analytics.clickRate
      : delivered > 0
      ? Number(((clicked / delivered) * 100).toFixed(1))
      : 0;
  const failRate = sent > 0 ? ((failed / sent) * 100).toFixed(1) : "0.0";

  const steps = [
    {
      label: "1. Dispatched",
      count: sent,
      rate: "100%",
      subtext: "Audience sent to gateway",
      color: "oklch(0.535 0.235 275)",
      icon: Send,
    },
    {
      label: "2. Carrier Route",
      count: sent - failed,
      rate: sent > 0 ? `${(((sent - failed) / sent) * 100).toFixed(1)}%` : "0%",
      subtext: "Carrier handoff ack",
      color: "oklch(0.48 0.18 240)",
      icon: Smartphone,
    },
    {
      label: "3. Delivered",
      count: delivered,
      rate: `${deliveryRate}%`,
      subtext: "Handset DLR acknowledgment",
      color: "oklch(0.42 0.16 145)",
      icon: CheckCircle2,
    },
    {
      label: "4. Clicked Link",
      count: clicked,
      rate: `${clickRate}%`,
      subtext: "Brochure shortlink CTR",
      color: "oklch(0.50 0.17 80)",
      icon: MousePointerClick,
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
          <p className="text-2xl font-extrabold text-[var(--text-primary)] tabular-nums">{deliveryRate}%</p>
          <p className="text-[11px] font-medium text-[var(--text-muted)] mt-1">
            {delivered.toLocaleString()} of {sent.toLocaleString()} messages
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] mb-1">
            <span>Shortlink CTR</span>
            <MousePointerClick className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-[var(--text-primary)] tabular-nums">{clickRate}%</p>
          <p className="text-[11px] font-medium text-[var(--text-muted)] mt-1">
            {clicked.toLocaleString()} brochure & CTA link clicks
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] mb-1">
            <span>Segments Used</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-[var(--text-primary)] tabular-nums">
            {(analytics.totalSegmentsSent || 0).toLocaleString()}
          </p>
          <p className="text-[11px] font-medium text-[var(--text-muted)] mt-1">Carrier billing units</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] mb-1">
            <span>Delivery Dropout / DND</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-[var(--text-primary)] tabular-nums">{failRate}%</p>
          <p className="text-[11px] font-medium text-[var(--text-muted)] mt-1">
            {failed} failed or TRAI DND filtered
          </p>
        </div>
      </div>

      {/* ── VISUAL FUNNEL PIPELINE ── */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)] mb-0.5">SMS Engagement Funnel</h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Step-by-step carrier telemetry pipeline from dispatch to brochure clicks
          </p>
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
                    <span className="text-[11px] font-extrabold text-[var(--text-tertiary)] uppercase tracking-wider">
                      {st.label}
                    </span>
                    <Icon className="w-4 h-4" style={{ color: st.color }} />
                  </div>
                  <div className="text-xl font-extrabold text-[var(--text-primary)] tabular-nums">
                    {st.count.toLocaleString()}
                  </div>
                  <div className="text-xs font-bold mt-0.5" style={{ color: st.color }}>
                    {st.rate} conversion
                  </div>
                </div>
                <p className="text-[10px] font-medium text-[var(--text-muted)] mt-3 pt-2 border-t border-slate-200/70">
                  {st.subtext}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SENDER PHONE & POOL PERFORMANCE BREAKDOWN ── */}
      {analytics.senderBreakdown && analytics.senderBreakdown.length > 0 && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Multi-Sender Pool & Number Performance</span>
              </h3>
              <p className="text-xs font-medium text-[var(--text-tertiary)]">
                Isolated delivery, throughput, CTR, and segment consumption across distributed carrier phone numbers.
              </p>
            </div>
            <Badge variant="default" className="text-xs font-extrabold self-start sm:self-auto bg-amber-50 text-amber-900 border-amber-200">
              {analytics.senderBreakdown.length} Parallel Phone Stream{analytics.senderBreakdown.length > 1 ? "s" : ""}
            </Badge>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-extrabold text-[var(--text-tertiary)] uppercase tracking-wider">
                    <th className="py-2.5 px-3.5">Sender Number / ID</th>
                    <th className="py-2.5 px-3.5">Gateway Route</th>
                    <th className="py-2.5 px-3.5 text-right">Allocated Leads</th>
                    <th className="py-2.5 px-3.5 text-right">Dispatched</th>
                    <th className="py-2.5 px-3.5 text-right">Delivered</th>
                    <th className="py-2.5 px-3.5 text-right">Clicks (CTR)</th>
                    <th className="py-2.5 px-3.5 text-right">Segments</th>
                    <th className="py-2.5 px-3.5 text-right">Failed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.senderBreakdown.map((item: any) => {
                    const prov =
                      (SMS_PROVIDERS as Record<string, any>)[item.provider] ||
                      SMS_PROVIDERS.TWILIO;
                    return (
                      <tr key={item.senderPoolId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3.5">
                          <div className="font-extrabold text-[var(--text-primary)] font-mono">
                            {item.phoneNumber || item.senderId || "Default Gateway"}
                          </div>
                          {item.senderId && item.phoneNumber && (
                            <div className="text-[10px] text-[var(--text-tertiary)] font-bold">
                              ID: {item.senderId}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-800">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: prov.color }}
                            />
                            <span>{prov.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-right font-extrabold text-amber-700 tabular-nums">
                          {item.allocatedRecipients.toLocaleString()}
                        </td>
                        <td className="py-3 px-3.5 text-right font-bold text-slate-800 tabular-nums">
                          {item.sentCount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3.5 text-right tabular-nums">
                          <span className="font-extrabold text-emerald-600">{item.deliveryRate}%</span>
                          <div className="text-[10px] text-[var(--text-muted)] font-medium">
                            {item.deliveredCount.toLocaleString()}
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-right tabular-nums">
                          <span className="font-extrabold text-amber-600">{item.clickRate}%</span>
                          <div className="text-[10px] text-[var(--text-muted)] font-medium">
                            {item.clickedCount.toLocaleString()}
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-700 tabular-nums">
                          {(item.totalSegmentsSent || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3.5 text-right font-bold tabular-nums">
                          {item.failedCount > 0 ? (
                            <span className="text-rose-500 font-extrabold">{item.failedCount}</span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP CLICKED LINKS & HYGIENE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Clicked Links */}
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Top Clicked Destination Links</h3>
          {(!analytics.topClickedLinks || analytics.topClickedLinks.length === 0) ? (
            <p className="text-xs text-[var(--text-muted)]">No shortlink clicks recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {analytics.topClickedLinks.map((link: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80"
                >
                  <div className="flex items-center gap-2 overflow-hidden mr-3">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-bold text-[var(--text-primary)] font-mono truncate">
                      {link.url}
                    </span>
                  </div>
                  <Badge variant="default" className="text-xs font-extrabold shrink-0 tabular-nums">
                    {link.clicks} clicks
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Carrier Delivery & Hygiene */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Carrier Delivery Hygiene</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200/80">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-bold text-rose-900">Failed / DND Filtered</span>
              </div>
              <span className="text-xs font-extrabold text-rose-900 tabular-nums">
                {failed} ({failRate}%)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200/80">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-900">Segments Consumed</span>
              </div>
              <span className="text-xs font-extrabold text-amber-900 tabular-nums">
                {(analytics.totalSegmentsSent || 0).toLocaleString()} segs
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
