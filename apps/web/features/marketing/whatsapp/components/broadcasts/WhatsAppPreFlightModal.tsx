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
  AlertTriangle,
  MessageSquare,
  Clock,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  WA_CONVERSATION_PRICING,
  WA_MESSAGING_TIERS,
  USD_TO_INR_EXCHANGE_RATE,
  calculateWhatsAppBroadcastCost,
  type WhatsAppConversationCategory,
} from "@brokeros/constants";
import type { WhatsAppPreFlightCostSummary } from "@brokeros/types";

export interface WhatsAppPreFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLaunching: boolean;
  campaignTitle: string;
  templateName: string;
  templateCategory?: string;
  templateLanguage?: string;
  totalAudience: number;
  isScheduled?: boolean;
  scheduleTime?: string;
  costEstimate?: WhatsAppPreFlightCostSummary | null;
  accountPhoneNumber?: string;
  messagingTierKey?: string; // 'TIER_1K' | 'TIER_10K' | 'TIER_100K' | 'TIER_UNLIMITED'
}

export function WhatsAppPreFlightModal({
  isOpen,
  onClose,
  onConfirm,
  isLaunching,
  campaignTitle,
  templateName,
  templateCategory = "MARKETING",
  templateLanguage = "en_US",
  totalAudience,
  isScheduled = false,
  scheduleTime,
  costEstimate,
  accountPhoneNumber,
  messagingTierKey = "TIER_10K",
}: WhatsAppPreFlightModalProps) {
  if (!isOpen) return null;

  const normalizedCategory = (
    templateCategory || "MARKETING"
  ).toUpperCase() as WhatsAppConversationCategory;

  const pricing =
    WA_CONVERSATION_PRICING[normalizedCategory] ||
    WA_CONVERSATION_PRICING.MARKETING;

  const computedCost = calculateWhatsAppBroadcastCost(
    totalAudience,
    normalizedCategory
  );

  const totalCostINR = costEstimate?.totalCostINR ?? computedCost.totalCostINR;
  const totalCostUSD = costEstimate?.totalCostUSD ?? computedCost.totalCostUSD;
  const rateINR = costEstimate?.rateINR ?? computedCost.rateINR;
  const rateUSD = costEstimate?.rateUSD ?? computedCost.rateUSD;

  const tierInfo =
    WA_MESSAGING_TIERS[messagingTierKey] || WA_MESSAGING_TIERS.TIER_10K;
  const dailyLimit = tierInfo.dailyLimit;
  const isTierExceeded = totalAudience > dailyLimit;
  const tierPercentage =
    dailyLimit === Infinity
      ? 5
      : Math.min(100, Math.round((totalAudience / dailyLimit) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={() => !isLaunching && onClose()}
      />

      <div className="relative z-50 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-enter my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 px-6 py-5 text-white flex items-center justify-between border-b border-emerald-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 backdrop-blur-md border border-emerald-500/30 shadow-inner">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                WhatsApp Pre-Flight Dispatch Verification
              </h2>
              <p className="text-xs text-emerald-200/80 font-medium">
                Verify Meta conversation pricing, 24h category routing, and daily tier limits.
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
          {/* Campaign & Meta Template Overview Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
                Broadcast Name & Template
              </div>
              <div className="text-sm font-extrabold text-[var(--text-primary)] mt-0.5">
                {campaignTitle || "Untitled WhatsApp Broadcast"}
              </div>
              <div className="text-xs text-[var(--text-tertiary)] font-mono mt-0.5">
                Template: <span className="font-semibold text-slate-800">{templateName}</span> ({templateLanguage})
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-lg text-xs font-extrabold border"
                style={{
                  backgroundColor: `${pricing.color}15`,
                  color: pricing.color,
                  borderColor: `${pricing.color}35`,
                }}
              >
                {pricing.name}
              </span>
              {isScheduled && (
                <Badge variant="warning" className="text-xs font-bold">
                  <Clock className="w-3 h-3 mr-1" />
                  Scheduled
                </Badge>
              )}
            </div>
          </div>

          {/* Key Metric Projection Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Audience */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-1">
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>Audience</span>
              </div>
              <div className="text-xl font-extrabold text-emerald-950 tabular-nums">
                {totalAudience.toLocaleString()}
              </div>
              <div className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                Target WhatsApp contacts
              </div>
            </div>

            {/* Cost Per Conversation */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                <span>Rate / 24h Window</span>
              </div>
              <div className="text-xl font-extrabold text-slate-950 tabular-nums">
                ₹{rateINR.toFixed(2)}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                ~${rateUSD.toFixed(4)} USD
              </div>
            </div>

            {/* Total Cost in INR */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                <span className="font-extrabold text-sm">₹</span>
                <span>Total Cost (INR)</span>
              </div>
              <div className="text-xl font-extrabold text-amber-950 tabular-nums">
                ₹{totalCostINR.toFixed(2)}
              </div>
              <div className="text-[10px] font-semibold text-amber-700 mt-0.5">
                Meta Cloud API billing
              </div>
            </div>

            {/* Total Cost in USD */}
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/70">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-purple-700" />
                <span>Total Cost (USD)</span>
              </div>
              <div className="text-xl font-extrabold text-purple-950 tabular-nums">
                ${totalCostUSD.toFixed(2)}
              </div>
              <div className="text-[10px] font-semibold text-purple-700 mt-0.5">
                At 1 USD = ₹{USD_TO_INR_EXCHANGE_RATE}
              </div>
            </div>
          </div>

          {/* Exchange Rate Callout */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Currency Policy:
            </span>
            <span className="font-extrabold text-slate-900 font-mono">
              $1.00 USD = ₹{USD_TO_INR_EXCHANGE_RATE}.00 INR
            </span>
          </div>

          {/* Meta Daily Messaging Tier & Quota Utilization */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider">
                  Meta WABA Messaging Tier Limit
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">
                  {tierInfo.label} — {tierInfo.description}
                </p>
              </div>
              <Badge variant="brand" className="text-xs font-bold">
                {tierInfo.tier}
              </Badge>
            </div>

            {/* Utilization Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">
                  {totalAudience.toLocaleString()} / {dailyLimit === Infinity ? "Unlimited" : dailyLimit.toLocaleString()} recipients
                </span>
                <span className={isTierExceeded ? "text-rose-600 font-extrabold" : "text-emerald-600"}>
                  {dailyLimit === Infinity ? "0%" : `${tierPercentage}% tier quota`}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isTierExceeded
                      ? "bg-rose-500"
                      : tierPercentage > 80
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, tierPercentage)}%` }}
                />
              </div>
            </div>

            {isTierExceeded && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Messaging Tier Quota Exceeded:</strong> Your selected audience ({totalAudience.toLocaleString()}) exceeds your account daily limit ({dailyLimit.toLocaleString()}). Meta Cloud API will throttle subsequent messages or reject them unless tier upgrade conditions are met.
                </div>
              </div>
            )}
          </div>

          {/* Compliance & Safeguards Notice */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>BrokerOS Meta Cloud API Outbound Safeguard Guarantee</span>
            </div>
            <ul className="text-[11px] font-medium text-emerald-900 space-y-1 pl-5 list-disc">
              <li>
                <strong>24-Hour Rolling Window:</strong> Meta charges 1 conversation fee per unique recipient every 24 hours. Multiple messages to the same lead within this window incur no extra fee.
              </li>
              <li>
                <strong>Spam & Quality Score Protection:</strong> Adaptive pacing controls rate throttling to ensure account quality rating stays in GREEN status (block rate &lt; 0.1%).
              </li>
              <li>
                <strong>Realtime 2-Way Live Inbox:</strong> Any prospect replies or interactive button clicks immediately route into your WhatsApp Team Inbox for instant executive response.
              </li>
            </ul>
          </div>
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
            Cancel & Adjust
          </Button>

          <Button
            type="button"
            variant="luxury"
            size="default"
            onClick={onConfirm}
            disabled={isLaunching}
            className="gap-2 font-extrabold shadow-md px-5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isLaunching ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Launching Broadcast...</span>
              </>
            ) : isScheduled ? (
              <>
                <Clock className="w-4 h-4" />
                <span>Confirm & Schedule Broadcast</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Confirm & Dispatch Broadcast</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
