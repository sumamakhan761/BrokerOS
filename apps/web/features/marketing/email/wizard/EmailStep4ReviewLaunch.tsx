"use client";

import React from "react";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EMAIL_PROVIDERS } from "@brokeros/constants";
import type {
  AudienceSourceType,
  CsvLeadRow,
  EmailIntegrationItem,
  EmailProviderType,
} from "@/features/marketing/types";

export interface EmailStep4ReviewLaunchProps {
  audienceSource: AudienceSourceType;
  csvRecipients: CsvLeadRow[];
  projectName?: string;
  isCpCampaign: boolean;
  fromName: string;
  fromEmail: string;
  providerType: EmailProviderType;
  onProviderTypeChange: (val: EmailProviderType) => void;
  integrations: EmailIntegrationItem[];
  testEmail: string;
  onTestEmailChange: (val: string) => void;
  onSendTest: () => void;
  isSendingTest: boolean;
  testSendStatus: { ok: boolean; msg: string } | null;
  isSubmitting: boolean;
  onLaunch: () => void;
  onBack: () => void;
}

export function EmailStep4ReviewLaunch({
  audienceSource,
  csvRecipients,
  projectName,
  isCpCampaign,
  fromName,
  fromEmail,
  providerType,
  onProviderTypeChange,
  integrations,
  testEmail,
  onTestEmailChange,
  onSendTest,
  isSendingTest,
  testSendStatus,
  isSubmitting,
  onLaunch,
  onBack,
}: EmailStep4ReviewLaunchProps) {
  return (
    <div className="space-y-6 animate-enter">
      {/* 1. Pre-flight Campaign Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Pre-Flight Campaign Summary
            </h3>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Review all campaign parameters before initiating final broadcast.
            </p>
          </div>
          <Badge variant="success" className="text-[10px]">
            Ready to Launch
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
              Target Audience
            </div>
            <div className="text-xs font-extrabold text-[var(--text-primary)] mt-1">
              {audienceSource === "CRM_DATABASE" ? "CRM Filtered Leads" : "CSV Contact List"}
            </div>
            <div className="text-[11px] font-bold text-[var(--brand-600)] mt-0.5">
              {audienceSource === "CSV_UPLOAD"
                ? `${csvRecipients.length} Uploaded Rows`
                : "Live CRM Query"}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
              Associated Project
            </div>
            <div className="text-xs font-extrabold text-[var(--text-primary)] mt-1 truncate">
              {projectName || "Direct Broadcast"}
            </div>
            <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
              {isCpCampaign ? "Channel Partner" : "Direct Buyer"}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
              Sender Identity
            </div>
            <div className="text-xs font-extrabold text-[var(--text-primary)] mt-1 truncate">
              {fromName || "Sales Team"}
            </div>
            <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5 truncate">
              {fromEmail || "Configured Sender"}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
              Selected Engine
            </div>
            <div className="text-xs font-extrabold text-[var(--text-primary)] mt-1 truncate">
              {EMAIL_PROVIDERS[providerType]?.name || providerType}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
              Automated DKIM / SPF
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dispatch Provider Selection */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
            Select Dispatch Engine
          </h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Choose the sending provider for this broadcast.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div
            onClick={() => onProviderTypeChange("SYSTEM_DEFAULT")}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              providerType === "SYSTEM_DEFAULT"
                ? "border-[var(--brand-500)] bg-purple-50/50 shadow-xs ring-2 ring-purple-500/15"
                : "border-slate-200/80 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-extrabold text-xs text-[var(--text-primary)]">
                BrokerOS Master Engine (AWS SES)
              </span>
              <Badge variant="success" className="text-[10px]">
                Active
              </Badge>
            </div>
            <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
              Zero setup required, automatic high-inbox placement, $0.10/1k credits.
            </p>
          </div>

          {(["SENDGRID", "BREVO", "MAILCHIMP"] as const).map((prov) => {
            const activeInt = integrations.find((i) => i.provider === prov && i.isActive);
            const isSelected = providerType === prov;

            return (
              <div
                key={prov}
                onClick={() => onProviderTypeChange(prov)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-[var(--brand-500)] bg-purple-50/50 shadow-xs ring-2 ring-purple-500/15"
                    : "border-slate-200/80 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-xs text-[var(--text-primary)]">
                    {EMAIL_PROVIDERS[prov].name}
                  </span>
                  {activeInt ? (
                    <Badge variant="success" className="text-[10px]">
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="default" className="text-[10px]">
                      BYO Provider
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
                  {activeInt
                    ? `Connected as ${activeInt.fromName} (${activeInt.fromEmail})`
                    : EMAIL_PROVIDERS[prov].description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Test Send Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
        <div>
          <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
            Send Instant Test Email (Optional)
          </h4>
          <p className="text-[11px] font-medium text-[var(--text-tertiary)]">
            Send a sample email to your personal inbox to inspect layout and render quality on mobile.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="email"
            placeholder="Enter test email address (e.g. personal@gmail.com)..."
            value={testEmail}
            onChange={(e) => onTestEmailChange(e.target.value)}
            className="flex-1 w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSendTest}
            disabled={isSendingTest}
            className="w-full sm:w-auto"
          >
            {isSendingTest ? "Dispatching Test..." : "Send Test Preview"}
          </Button>
        </div>

        {testSendStatus && (
          <p
            className={`text-xs font-bold ${
              testSendStatus.ok ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {testSendStatus.msg}
          </p>
        )}
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
          <span>Back</span>
        </Button>
        <Button
          type="button"
          variant="luxury"
          size="default"
          onClick={onLaunch}
          disabled={isSubmitting}
          className="gap-2 font-extrabold shadow-md"
        >
          {isSubmitting ? (
            <Sparkles className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>{isSubmitting ? "Initiating Broadcast..." : "Launch Campaign Now"}</span>
        </Button>
      </div>
    </div>
  );
}
