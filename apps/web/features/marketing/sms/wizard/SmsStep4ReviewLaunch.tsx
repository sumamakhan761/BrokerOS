"use client";

import React from "react";
import {
  Smartphone,
  Calendar,
  Send,
  Zap,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SMS_PROVIDERS } from "@brokeros/constants";
import type {
  AudienceSourceType,
  CsvLeadRow,
  SmsProviderType,
} from "@/features/marketing/types";

export interface SmsStep4ReviewLaunchProps {
  audienceSource: AudienceSourceType;
  csvRecipients: CsvLeadRow[];
  fromSender: string;
  providerType: SmsProviderType;
  projectName?: string;
  testPhone: string;
  onTestPhoneChange: (val: string) => void;
  onSendTest: () => void;
  isSendingTest: boolean;
  testSendStatus: { ok: boolean; msg: string } | null;
  scheduledAt: string;
  onScheduledAtChange: (val: string) => void;
  isSubmitting: boolean;
  onLaunch: () => void;
  onBack: () => void;
}

export function SmsStep4ReviewLaunch({
  audienceSource,
  csvRecipients,
  fromSender,
  providerType,
  projectName,
  testPhone,
  onTestPhoneChange,
  onSendTest,
  isSendingTest,
  testSendStatus,
  scheduledAt,
  onScheduledAtChange,
  isSubmitting,
  onLaunch,
  onBack,
}: SmsStep4ReviewLaunchProps) {
  return (
    <div className="space-y-6 animate-enter">
      {/* 1. Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase text-[var(--text-tertiary)] tracking-wider">
            Audience Source
          </span>
          <div className="mt-1.5 text-xl font-extrabold text-[var(--text-primary)]">
            {audienceSource === "CSV_UPLOAD" ? "CSV File Upload" : "CRM Leads Query"}
          </div>
          <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5">
            {audienceSource === "CSV_UPLOAD"
              ? `${csvRecipients.length.toLocaleString()} uploaded contacts`
              : "Active pre-sales pipeline filters"}
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase text-[var(--text-tertiary)] tracking-wider">
            Sender Header & Route
          </span>
          <div className="mt-1.5 text-xl font-extrabold text-[var(--text-primary)]">
            {fromSender || "BrokerOS"}
          </div>
          <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5">
            Route: {SMS_PROVIDERS[providerType]?.name || providerType}
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase text-[var(--text-tertiary)] tracking-wider">
            Linked Project Asset
          </span>
          <div className="mt-1.5 text-xl font-extrabold text-[var(--text-primary)] truncate">
            {projectName || "General Broadcast"}
          </div>
          <p className="text-xs font-bold text-amber-600 mt-0.5">
            Dynamic Shortlink & CTR Tracking Enabled
          </p>
        </div>
      </div>

      {/* 2. Live Test SMS Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[var(--brand-600)]" />
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                Dispatch Live Test SMS
              </h3>
            </div>
            <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
              Verify handset rendering, merge tags replacement, and shortlink redirection on your mobile device.
            </p>
          </div>
          <Badge variant="brand" className="text-[10px]">
            Pre-Flight
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="tel"
            placeholder="Enter mobile phone (e.g. +91 98765 43210)"
            value={testPhone}
            onChange={(e) => onTestPhoneChange(e.target.value)}
            className="w-full sm:flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSendTest}
            disabled={isSendingTest || !testPhone}
            className="w-full sm:w-auto h-9 px-4 text-xs font-bold gap-2"
          >
            <Send className={`w-3.5 h-3.5 ${isSendingTest ? "animate-spin" : ""}`} />
            <span>{isSendingTest ? "Sending Test..." : "Send Test SMS"}</span>
          </Button>
        </div>

        {testSendStatus && (
          <div
            className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-xs ${
              testSendStatus.ok
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {testSendStatus.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{testSendStatus.msg}</span>
          </div>
        )}
      </div>

      {/* 3. Optional Schedule Time Picker */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--brand-600)]" />
          <label
            htmlFor="smsScheduledAt"
            className="text-xs font-extrabold text-[var(--text-primary)]"
          >
            Schedule for Future Dispatch (Optional — Leave blank to launch immediately)
          </label>
        </div>
        <input
          id="smsScheduledAt"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => onScheduledAtChange(e.target.value)}
          className="w-full sm:max-w-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
        />
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          className="gap-2 text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Message Editor</span>
        </Button>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={onLaunch}
          disabled={isSubmitting}
          className="gap-2 text-xs font-bold shadow-md bg-amber-600 hover:bg-amber-700"
        >
          <Zap className="w-4 h-4" />
          <span>{isSubmitting ? "Launching Broadcast..." : "Launch SMS Campaign Now"}</span>
        </Button>
      </div>
    </div>
  );
}
