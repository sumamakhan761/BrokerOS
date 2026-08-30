"use client";

import React from "react";
import { Building, Clock, Calendar, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface VoiceStep1ProjectScheduleProps {
  formData: {
    title: string;
    projectId?: string;
    isCpCampaign: boolean;
    callingWindowStart?: string;
    callingWindowEnd?: string;
    scheduledAt?: string;
    maxConcurrentCalls?: number;
    retryLimit?: number;
  };
  onChange: (fields: Partial<VoiceStep1ProjectScheduleProps["formData"]>) => void;
  projects?: Array<{ id: string; name: string; city?: string }>;
  onNext?: () => void;
}

export function VoiceStep1ProjectSchedule({
  formData,
  onChange,
  projects = [],
  onNext,
}: VoiceStep1ProjectScheduleProps) {
  const isNextDisabled = !formData.title.trim();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-black tracking-tight text-[var(--text-primary)]">
          Step 1: Campaign Scope & Calling Hours
        </h2>
        <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
          Configure project inventory boundary, legally compliant calling windows, and concurrency limits.
        </p>
      </div>

      {/* Campaign Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <label className="text-xs font-extrabold text-[var(--text-primary)]">
            Campaign Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g. DLF Privana West - Exclusive AI Voice VIP Launch"
            className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Project Selector & Business World Boundary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-600" />
              <span>Target Real Estate Project</span>
            </label>
            <select
              value={formData.projectId || ""}
              onChange={(e) => onChange({ projectId: e.target.value || undefined })}
              className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Active Projects (General Outreach)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.city ? `(${p.city})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* isCpCampaign toggle */}
          <div>
            <label className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Business World Isolation</span>
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => onChange({ isCpCampaign: false })}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all ${
                  !formData.isCpCampaign
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                Brokerage (Internal)
              </button>

              <button
                type="button"
                onClick={() => onChange({ isCpCampaign: true })}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all ${
                  formData.isCpCampaign
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                Channel Partner (CP)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calling Hours Window & Concurrency Guardrail */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>Calling Hours Window & Pacing Guardrails</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-600">Calling Window Start</label>
            <input
              type="time"
              value={formData.callingWindowStart || "10:00"}
              onChange={(e) => onChange({ callingWindowStart: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600">Calling Window End</label>
            <input
              type="time"
              value={formData.callingWindowEnd || "19:00"}
              onChange={(e) => onChange({ callingWindowEnd: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600">Max Concurrent Channels</label>
            <input
              type="number"
              min={1}
              max={20}
              value={formData.maxConcurrentCalls || 5}
              onChange={(e) => onChange({ maxConcurrentCalls: Number(e.target.value) })}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600">Busy / No-Answer Retries</label>
            <select
              value={formData.retryLimit || 1}
              onChange={(e) => onChange({ retryLimit: Number(e.target.value) })}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
            >
              <option value={0}>0 (No Retries)</option>
              <option value={1}>1 Retry</option>
              <option value={2}>2 Retries</option>
            </select>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 font-medium italic">
          Calls outside the designated hours will be safely paused by the background worker until the next calling window.
        </p>
      </div>

      {/* Schedule Launch Datetime */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <label className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>Launch Timing</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange({ scheduledAt: undefined })}
            className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
              !formData.scheduledAt
                ? "border-indigo-600 bg-indigo-50/40 text-indigo-900 ring-2 ring-indigo-500/20"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>Immediate Launch</span>
              <Badge variant="success" className="text-[9px]">Instant</Badge>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Begin dialing as soon as the campaign is confirmed.
            </p>
          </button>

          <div
            className={`p-3 rounded-xl border transition-all ${
              formData.scheduledAt
                ? "border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20"
                : "border-slate-200"
            }`}
          >
            <label className="text-xs font-bold text-slate-700 block mb-1">Schedule For Later</label>
            <input
              type="datetime-local"
              value={formData.scheduledAt || ""}
              onChange={(e) => onChange({ scheduledAt: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold"
            />
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      {onNext && (
        <div className="flex justify-end pt-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onNext}
            disabled={isNextDisabled}
            className="gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 shadow-sm"
          >
            <span>Continue to Target Audience</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
