"use client";

import React from "react";
import {
  Send,
  Sparkles,
  X,
  ShieldCheck,
  Zap,
  DollarSign,
  Users,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EMAIL_PROVIDER_PRICING_ESTIMATES, EMAIL_PROVIDERS } from "@brokeros/constants";
import type {
  CampaignSenderPoolConfig,
  PreFlightCostSummary,
  EmailProviderType,
} from "@brokeros/types";

export interface EmailPreFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLaunching: boolean;
  campaignTitle: string;
  totalAudience: number;
  senderPools: CampaignSenderPoolConfig[];
  allocationMode: "AUTO_EVEN" | "CUSTOM_PERCENTAGE";
  costEstimate?: PreFlightCostSummary | null;
  isLoadingEstimate?: boolean;
}

export function EmailPreFlightModal({
  isOpen,
  onClose,
  onConfirm,
  isLaunching,
  campaignTitle,
  totalAudience,
  senderPools,
  allocationMode,
  costEstimate,
  isLoadingEstimate = false,
}: EmailPreFlightModalProps) {
  if (!isOpen) return null;

  // Compute fallback line items if backend estimate is pending
  const computedLineItems = senderPools.map((pool) => {
    const prov = (pool.provider || "SYSTEM_DEFAULT") as EmailProviderType;
    const pricing =
      (EMAIL_PROVIDER_PRICING_ESTIMATES as Record<string, any>)[prov] ||
      EMAIL_PROVIDER_PRICING_ESTIMATES.SYSTEM_DEFAULT;
    const leads =
      pool.allocatedLeads ??
      Math.round((totalAudience * (pool.allocationPercentage || 0)) / 100);
    const estUSD = (leads * pricing.costPer1kUSD) / 1000;
    const estINR = (leads * pricing.costPer1kINR) / 1000;

    return {
      provider: prov,
      domain: pool.domain || "default",
      fromEmail: pool.fromEmail || "default",
      fromName: pool.fromName || "Sales Team",
      percentage: pool.allocationPercentage || 0,
      allocatedLeads: leads,
      costPer1kUSD: pricing.costPer1kUSD,
      costPer1kINR: pricing.costPer1kINR,
      estimatedCostUSD: estUSD,
      estimatedCostINR: estINR,
    };
  });

  const totalCostUSD =
    costEstimate?.totalCostUSD ??
    computedLineItems.reduce((acc, item) => acc + item.estimatedCostUSD, 0);

  const totalCostINR =
    costEstimate?.totalCostINR ??
    computedLineItems.reduce((acc, item) => acc + item.estimatedCostINR, 0);

  // Check if any single domain exceeds 5,000 for warmup reminder
  const hasHighVolumeDomain = computedLineItems.some(
    (item) => item.allocatedLeads > 5000
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={() => !isLaunching && onClose()}
      />

      <div className="relative z-50 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-enter my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-purple-200 backdrop-blur-md border border-white/10 shadow-inner">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Pre-Flight Dispatch Confirmation
              </h2>
              <p className="text-xs text-purple-200/80 font-medium">
                Review audience distribution, engine routing, and cost projections.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLaunching}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-160px)] overflow-y-auto">
          {/* Campaign Overview Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
                Campaign Title
              </div>
              <div className="text-sm font-extrabold text-[var(--text-primary)] mt-0.5">
                {campaignTitle || "Untitled Campaign"}
              </div>
            </div>
            <Badge variant="brand" className="text-xs font-extrabold">
              {allocationMode === "AUTO_EVEN" ? "Auto-Even Split" : "Custom Weighted"}
            </Badge>
          </div>

          {/* Key Metric Projection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/70">
              <div className="flex items-center justify-between text-purple-800 text-xs font-bold mb-1">
                <span>Total Audience</span>
                <Users className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-purple-950 tabular-nums">
                {totalAudience.toLocaleString()}
              </div>
              <div className="text-[11px] font-semibold text-purple-700 mt-0.5">
                Target Recipients
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70">
              <div className="flex items-center justify-between text-emerald-800 text-xs font-bold mb-1">
                <span>Cost (USD)</span>
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-emerald-950 tabular-nums">
                ${totalCostUSD.toFixed(3)}
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                {computedLineItems.length} Sending Streams
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70">
              <div className="flex items-center justify-between text-amber-800 text-xs font-bold mb-1">
                <span>Cost (INR)</span>
                <span className="font-extrabold text-sm">₹</span>
              </div>
              <div className="text-2xl font-black text-amber-950 tabular-nums">
                ₹{totalCostINR.toFixed(2)}
              </div>
              <div className="text-[11px] font-semibold text-amber-700 mt-0.5">
                Est. ₹{(totalCostINR / (totalAudience || 1)).toFixed(4)}/email
              </div>
            </div>
          </div>

          {/* Per-Domain Stream Allocation Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider">
                Sending Domain & Engine Allocation
              </h4>
              <span className="text-[11px] font-semibold text-[var(--text-tertiary)]">
                {computedLineItems.length} active mailboxes
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-extrabold text-[var(--text-tertiary)] uppercase tracking-wider">
                      <th className="py-2.5 px-3.5">Sender Mailbox</th>
                      <th className="py-2.5 px-3.5">Engine</th>
                      <th className="py-2.5 px-3.5 text-right">Allocation</th>
                      <th className="py-2.5 px-3.5 text-right">Est. Volume</th>
                      <th className="py-2.5 px-3.5 text-right">Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {computedLineItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3.5">
                          <div className="font-extrabold text-[var(--text-primary)]">
                            {item.domain}
                          </div>
                          <div className="text-[11px] text-[var(--text-tertiary)] font-medium truncate max-w-[180px]">
                            {item.fromEmail}
                          </div>
                        </td>
                        <td className="py-3 px-3.5">
                          <Badge variant="default" className="text-[10px] font-extrabold">
                            {(EMAIL_PROVIDERS as Record<string, any>)[item.provider]?.name || item.provider}
                          </Badge>
                        </td>
                        <td className="py-3 px-3.5 text-right font-extrabold text-purple-700 tabular-nums">
                          {item.percentage}%
                        </td>
                        <td className="py-3 px-3.5 text-right font-bold text-[var(--text-primary)] tabular-nums">
                          {item.allocatedLeads.toLocaleString()} leads
                        </td>
                        <td className="py-3 px-3.5 text-right font-bold text-slate-700 tabular-nums">
                          ${item.estimatedCostUSD.toFixed(3)}
                          <div className="text-[10px] text-[var(--text-muted)]">
                            ₹{item.estimatedCostINR.toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Deliverability & Safety Callout */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>BrokerOS Parallel Outbound Safety Guarantee</span>
            </div>
            <p className="text-[11px] font-medium text-indigo-800 leading-relaxed">
              Broadcast jobs are processed through distributed BullMQ workers. Each domain runs in an isolated stream with provider rate throttling (10–35ms intervals) and automatic 429 exponential backoff to preserve inbox reputation.
            </p>
          </div>

          {hasHighVolumeDomain && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
                <strong className="font-bold">High Domain Volume:</strong> One or more domains are allocated over 5,000 emails. If this is a new mailbox, ensure it has completed its deliverability warmup schedule.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLaunching}
            className="text-xs font-bold"
          >
            Back & Adjust
          </Button>

          <Button
            type="button"
            variant="luxury"
            size="default"
            onClick={onConfirm}
            disabled={isLaunching}
            className="gap-2 font-extrabold shadow-md px-5"
          >
            {isLaunching ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Launching Broadcast...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Confirm & Dispatch Campaign</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
