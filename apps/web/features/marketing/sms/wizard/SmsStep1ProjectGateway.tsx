"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SMS_PROVIDERS } from "@brokeros/constants";
import type { SmsProviderType } from "@/features/marketing/types";

export interface SmsStep1ProjectGatewayProps {
  title: string;
  onTitleChange: (val: string) => void;
  projectId: string;
  onProjectIdChange: (val: string) => void;
  isCpCampaign: boolean;
  onIsCpCampaignChange: (val: boolean) => void;
  providerType: SmsProviderType;
  onProviderTypeChange: (val: SmsProviderType) => void;
  fromSender: string;
  onFromSenderChange: (val: string) => void;
  dltTemplateId: string;
  onDltTemplateIdChange: (val: string) => void;
  projects: Array<{ id: string; name: string }>;
  isLoadingProjects: boolean;
  onNext: () => void;
}

export function SmsStep1ProjectGateway({
  title,
  onTitleChange,
  projectId,
  onProjectIdChange,
  isCpCampaign,
  onIsCpCampaignChange,
  providerType,
  onProviderTypeChange,
  fromSender,
  onFromSenderChange,
  dltTemplateId,
  onDltTemplateIdChange,
  projects,
  isLoadingProjects,
  onNext,
}: SmsStep1ProjectGatewayProps) {
  const isNextDisabled = !title.trim() || !fromSender.trim();

  return (
    <div className="space-y-6 animate-enter">
      {/* Card 1: Overview & Scope */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              General SMS Campaign Setup
            </h3>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Define campaign title, target business world, and optional linked real estate project.
            </p>
          </div>
          <Badge variant="default" className="text-[10px]">
            Setup
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="smsCampaignTitle"
              className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5"
            >
              Campaign Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="smsCampaignTitle"
              type="text"
              required
              placeholder="e.g. Skyline Luxuria — Pre-Launch VIP SMS Broadcast"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="smsProjectSelect"
                className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5"
              >
                Associated Real Estate Project
              </label>
              <select
                id="smsProjectSelect"
                value={projectId}
                onChange={(e) => onProjectIdChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
              >
                <option value="">No Project (General Outbound SMS)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {projects.length === 0 && !isLoadingProjects && (
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  No active projects in inventory. You can still dispatch general broadcasts.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
                Target Business World
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onIsCpCampaignChange(false)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                    !isCpCampaign
                      ? "bg-amber-50 border-amber-500 text-amber-800 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-[var(--text-secondary)] hover:bg-slate-100"
                  }`}
                >
                  Direct Brokerage (Buyers)
                </button>
                <button
                  type="button"
                  onClick={() => onIsCpCampaignChange(true)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                    isCpCampaign
                      ? "bg-amber-50 border-amber-500 text-amber-800 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-[var(--text-secondary)] hover:bg-slate-100"
                  }`}
                >
                  Channel Partner Network
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Gateway & Sender Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Carrier Gateway & Sender Header
            </h3>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Configure delivery route and registered sender identity.
            </p>
          </div>
          <Badge variant="default" className="text-[10px]">
            Carrier
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="smsProviderType"
              className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5"
            >
              SMS Gateway Route
            </label>
            <select
              id="smsProviderType"
              value={providerType}
              onChange={(e) => onProviderTypeChange(e.target.value as SmsProviderType)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
            >
              {Object.values(SMS_PROVIDERS).map((meta) => (
                <option key={meta.id} value={meta.id}>
                  {meta.name} ({meta.badge})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="smsFromSender"
              className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5"
            >
              Sender Phone / Alphanumeric Header <span className="text-rose-500">*</span>
            </label>
            <input
              id="smsFromSender"
              type="text"
              required
              placeholder="e.g. SKYLIN or +14155550199"
              value={fromSender}
              onChange={(e) => onFromSenderChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
            />
          </div>

          <div>
            <label
              htmlFor="smsDltId"
              className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5"
            >
              DLT Principal Entity ID (Optional)
            </label>
            <input
              id="smsDltId"
              type="text"
              placeholder="e.g. 1701159123456789"
              value={dltTemplateId}
              onChange={(e) => onDltTemplateIdChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-end pt-2">
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={onNext}
          disabled={isNextDisabled}
          className="gap-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 shadow-sm"
        >
          <span>Continue to Audience</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
