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
  Layers,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SMS_PROVIDER_PRICING_ESTIMATES, SMS_PROVIDERS, calculateSmsSegments } from "@brokeros/constants";
import type {
  CampaignSmsSenderPoolConfig,
  SmsPreFlightCostSummary,
  SmsProviderType,
} from "@brokeros/types";

export interface SmsPreFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLaunching: boolean;
  campaignTitle: string;
  messageContent: string;
  totalAudience: number;
  senderPools: CampaignSmsSenderPoolConfig[];
  allocationMode: "AUTO_EVEN" | "CUSTOM_PERCENTAGE";
  costEstimate?: SmsPreFlightCostSummary | null;
  isLoadingEstimate?: boolean;
}

export function SmsPreFlightModal({
  isOpen,
  onClose,
  onConfirm,
  isLaunching,
  campaignTitle,
  messageContent,
  totalAudience,
  senderPools,
  allocationMode,
  costEstimate,
  isLoadingEstimate = false,
}: SmsPreFlightModalProps) {
  if (!isOpen) return null;

  const { segments, isUnicode, charCount } = calculateSmsSegments(messageContent || "");

  // Fallback calculation if backend estimate is pending
  const computedLineItems = senderPools.map((pool) => {
    const prov = (pool.provider || "TWILIO") as SmsProviderType;
    const pricing =
      (SMS_PROVIDER_PRICING_ESTIMATES as Record<string, any>)[prov] ||
      SMS_PROVIDER_PRICING_ESTIMATES.TWILIO;
    const leads =
      pool.allocatedLeads ??
      Math.round((totalAudience * (pool.allocationPercentage || 0)) / 100);
    const poolSegments = leads * segments;
    const estUSD = poolSegments * pricing.costPerSegmentUSD;
    const estINR = poolSegments * pricing.costPerSegmentINR;

    return {
      provider: prov,
      phoneNumber: pool.phoneNumber || pool.senderId || "Default Sender",
      senderId: pool.senderId,
      percentage: pool.allocationPercentage || 0,
      allocatedLeads: leads,
      estimatedSegments: poolSegments,
      costPerSegmentUSD: pricing.costPerSegmentUSD,
      costPerSegmentINR: pricing.costPerSegmentINR,
      costUSD: estUSD,
      costINR: estINR,
    };
  });

  const totalSegments = totalAudience * segments;

  const totalCostUSD =
    costEstimate?.totalCostUSD ??
    computedLineItems.reduce((acc, item) => acc + item.costUSD, 0);

  const totalCostINR =
    costEstimate?.totalCostINR ??
    computedLineItems.reduce((acc, item) => acc + item.costINR, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={() => !isLaunching && onClose()}
      />

      <div className="relative z-50 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-enter my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 px-6 py-5 text-white flex items-center justify-between border-b border-amber-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 backdrop-blur-md border border-amber-500/30 shadow-inner">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                SMS Pre-Flight Dispatch Verification
              </h2>
              <p className="text-xs text-amber-200/80 font-medium">
                Verify audience partitioning, carrier billing segments, and pricing projections.
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
                Campaign Title & Encoding
              </div>
              <div className="text-sm font-extrabold text-[var(--text-primary)] mt-0.5">
                {campaignTitle || "Untitled SMS Campaign"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                isUnicode ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
              }`}>
                {isUnicode ? "Unicode (UCS-2)" : "GSM-7 Plain"}
              </span>
              <Badge variant="default" className="text-xs font-extrabold">
                {allocationMode === "AUTO_EVEN" ? "Auto-Even Split" : "Custom Weighted"}
              </Badge>
            </div>
          </div>

          {/* Key Metric Projection Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                <Users className="w-3.5 h-3.5 text-amber-700" />
                <span>Audience</span>
              </div>
              <div className="text-xl font-extrabold text-amber-950 tabular-nums">
                {totalAudience.toLocaleString()}
              </div>
              <div className="text-[10px] font-semibold text-amber-700 mt-0.5">
                Target phone numbers
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                <span>Message Parts</span>
              </div>
              <div className="text-xl font-extrabold text-slate-950 tabular-nums">
                {segments} <span className="text-xs font-normal text-slate-500">seg / lead</span>
              </div>
              <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                {charCount} characters
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                <span>Total Billing Segments</span>
              </div>
              <div className="text-xl font-extrabold text-slate-950 tabular-nums">
                {totalSegments.toLocaleString()}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                Carrier billable units
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                <span>Estimated Cost</span>
              </div>
              <div className="text-xl font-extrabold text-emerald-950 tabular-nums">
                ${totalCostUSD.toFixed(2)}
              </div>
              <div className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                ~₹{totalCostINR.toFixed(0)} INR
              </div>
            </div>
          </div>

          {/* Sender Pool Distribution Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
                Multi-Sender Routing & Quota Breakdown
              </h3>
              <span className="text-xs font-bold text-[var(--text-tertiary)]">
                {senderPools.length} Phone Stream{senderPools.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-extrabold text-[var(--text-tertiary)] uppercase tracking-wider">
                    <th className="py-2.5 px-3.5">Sender Phone / Route</th>
                    <th className="py-2.5 px-3.5">Gateway</th>
                    <th className="py-2.5 px-3.5 text-right">Quota</th>
                    <th className="py-2.5 px-3.5 text-right">Leads</th>
                    <th className="py-2.5 px-3.5 text-right">Segments</th>
                    <th className="py-2.5 px-3.5 text-right">Estimated Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {computedLineItems.map((item, idx) => {
                    const prov =
                      (SMS_PROVIDERS as Record<string, any>)[item.provider] ||
                      SMS_PROVIDERS.TWILIO;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3.5">
                          <div className="font-extrabold text-[var(--text-primary)] font-mono">
                            {item.phoneNumber}
                          </div>
                          {item.senderId && (
                            <div className="text-[10px] text-[var(--text-muted)] font-bold">
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
                          {item.percentage}%
                        </td>
                        <td className="py-3 px-3.5 text-right font-bold text-slate-800 tabular-nums">
                          {item.allocatedLeads.toLocaleString()}
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-600 tabular-nums">
                          {item.estimatedSegments.toLocaleString()}
                        </td>
                        <td className="py-3 px-3.5 text-right tabular-nums">
                          <div className="font-extrabold text-emerald-700">
                            ${item.costUSD.toFixed(3)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            ~₹{item.costINR.toFixed(1)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance & Safeguard Alert */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs text-slate-700">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-slate-900">
                Carrier Bridge Parallelism & Anti-Block Safeguards Active:
              </span>{" "}
              Each phone stream executes in dedicated concurrency loops with adaptive pacing (25ms - 150ms delay) and automated HTTP 429 exponential backoff. Inbound replies are automatically routed to the 2-Way Live Team Inbox.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200/80 px-6 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLaunching}
            className="text-xs font-bold"
          >
            Cancel & Edit
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onConfirm}
            disabled={isLaunching || isLoadingEstimate}
            className="gap-2 text-xs font-extrabold shadow-sm bg-amber-500 hover:bg-amber-600 text-slate-950 px-5"
          >
            <Send className={`w-3.5 h-3.5 ${isLaunching ? "animate-spin" : ""}`} />
            <span>{isLaunching ? "Dispatching Broadcast..." : "Confirm & Launch Broadcast"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
