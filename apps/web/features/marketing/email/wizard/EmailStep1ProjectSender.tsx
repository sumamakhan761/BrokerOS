"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface EmailStep1ProjectSenderProps {
  title: string;
  onTitleChange: (val: string) => void;
  projectId: string;
  onProjectIdChange: (val: string) => void;
  isCpCampaign: boolean;
  onIsCpCampaignChange: (val: boolean) => void;
  fromName: string;
  onFromNameChange: (val: string) => void;
  fromEmail: string;
  onFromEmailChange: (val: string) => void;
  replyTo: string;
  onReplyToChange: (val: string) => void;
  projects: Array<{ id: string; name: string }>;
  isLoadingProjects: boolean;
  onNext: () => void;
}

export function EmailStep1ProjectSender({
  title,
  onTitleChange,
  projectId,
  onProjectIdChange,
  isCpCampaign,
  onIsCpCampaignChange,
  fromName,
  onFromNameChange,
  fromEmail,
  onFromEmailChange,
  replyTo,
  onReplyToChange,
  projects,
  isLoadingProjects,
  onNext,
}: EmailStep1ProjectSenderProps) {
  const isNextDisabled = !title.trim();

  return (
    <div className="space-y-6 animate-enter">
      {/* Card 1: Overview & Scope */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
            General Campaign Setup
          </h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Define campaign title and optionally link to a specific real estate project.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="campaignTitle"
              className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5"
            >
              Campaign Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="campaignTitle"
              type="text"
              required
              placeholder="e.g. Festive Launch Special — Towers A & B"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="associatedProject"
                className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5"
              >
                Associated Real Estate Project
              </label>
              <select
                id="associatedProject"
                value={projectId}
                onChange={(e) => onProjectIdChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
              >
                <option value="">No Project (General Outbound Broadcast)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {projects.length === 0 && !isLoadingProjects && (
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  No active projects in inventory. You can still send a general broadcast.
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
                      ? "bg-purple-50 border-[var(--brand-500)] text-[var(--brand-700)] shadow-xs"
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
                      ? "bg-purple-50 border-[var(--brand-500)] text-[var(--brand-700)] shadow-xs"
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

      {/* Card 2: Sender Profile */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
              Sender Identity & Reply Channels
            </h3>
            <p className="text-xs font-medium text-[var(--text-tertiary)]">
              Recipients will see this sender name and email in their inbox.
            </p>
          </div>
          <Badge variant="default" className="text-[10px]">
            Sender Config
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
              From Display Name
            </label>
            <input
              type="text"
              placeholder="e.g. Skyline Sales Team"
              value={fromName}
              onChange={(e) => onFromNameChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
              From Email Address (Override)
            </label>
            <input
              type="email"
              placeholder="Leave empty to use Provider default"
              value={fromEmail}
              onChange={(e) => onFromEmailChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-1.5">
              Reply-To Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. support@yourfirm.com"
              value={replyTo}
              onChange={(e) => onReplyToChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <div />
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={onNext}
          disabled={isNextDisabled}
          className="gap-2 text-xs font-bold shadow-sm"
        >
          <span>Continue to Audience</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
