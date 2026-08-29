"use client";

import React, { useMemo } from "react";
import {
  Sparkles,
  AlertTriangle,
  Link as LinkIcon,
  FileText,
  CheckCircle2,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { DEFAULT_SMS_MERGE_TAGS, DEFAULT_SMS_TEMPLATES } from "@brokeros/constants";
import { Badge } from "@/components/ui/Badge";

export interface SmsMessageEditorProps {
  value: string;
  onChange: (value: string) => void;
  dltTemplateId?: string;
  onDltTemplateIdChange?: (id: string) => void;
  disabled?: boolean;
}

// Standard GSM-7 character set test
const GSM7_REGEX = /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ\x1BÆæßÉ !"#¤%&'()*+,\-./0-9:;<=>?¡A-ZÄÖÑÜ§¿a-zäöñüà^{}\\[~\]|€]*$/;

export function SmsMessageEditor({
  value,
  onChange,
  dltTemplateId,
  onDltTemplateIdChange,
  disabled = false,
}: SmsMessageEditorProps) {
  const { charCount, segments, isUnicode } = useMemo(() => {
    const chars = value.length;
    const unicode = !GSM7_REGEX.test(value);

    if (unicode) {
      const totalSegs = chars === 0 ? 1 : Math.ceil(chars / (chars <= 70 ? 70 : 67));
      return { charCount: chars, segments: totalSegs, isUnicode: true };
    } else {
      const totalSegs = chars === 0 ? 1 : chars <= 160 ? 1 : Math.ceil(chars / 153);
      return { charCount: chars, segments: totalSegs, isUnicode: false };
    }
  }, [value]);

  const insertTag = (tag: string) => {
    onChange(`${value}${value ? " " : ""}${tag}`);
  };

  const applyTemplate = (template: (typeof DEFAULT_SMS_TEMPLATES)[number]) => {
    onChange(template.message);
    if (onDltTemplateIdChange && template.dltTemplateId) {
      onDltTemplateIdChange(template.dltTemplateId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Real Estate Template Presets */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--brand-600)]" />
            <span className="text-xs font-extrabold text-[var(--text-primary)]">
              Quick Real Estate SMS Templates
            </span>
          </div>
          <Badge variant="brand" className="text-[10px]">
            1-Click Apply
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {DEFAULT_SMS_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => applyTemplate(tmpl)}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-purple-50 text-[var(--text-secondary)] hover:text-[var(--brand-700)] border border-slate-200/80 hover:border-purple-300 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              <span>{tmpl.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Copy Textarea */}
      <div className="space-y-1.5">
        <label
          htmlFor="smsMessageContent"
          className="block text-xs font-extrabold text-[var(--text-primary)]"
        >
          SMS Message Copy <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="smsMessageContent"
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Hi {{lead.firstName}}, exclusive pre-launch booking is now open for {{project.name}} starting at {{project.startingPrice}}. View brochure: {{shortUrl}} - {{agent.phone}}"
          className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs font-medium leading-relaxed text-[var(--text-primary)] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] shadow-xs transition-all disabled:opacity-50"
        />

        {/* Live Segment Meter Floating Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                isUnicode
                  ? "bg-amber-100 text-amber-900 border border-amber-300/80"
                  : "bg-emerald-100 text-emerald-900 border border-emerald-300/80"
              }`}
            >
              {isUnicode ? (
                <>
                  <AlertTriangle className="w-3 h-3 text-amber-700" />
                  Unicode (UCS-2)
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  GSM-7 Standard
                </>
              )}
            </span>

            <span className="font-extrabold text-[var(--text-primary)] tabular-nums">
              {charCount} {charCount === 1 ? "character" : "characters"}
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/80 font-mono font-bold text-[11px] text-[var(--text-primary)]">
              {segments} {segments === 1 ? "Segment" : "Segments"}
            </span>
          </div>

          <div className="text-[11px] font-medium text-[var(--text-muted)]">
            {isUnicode ? "Max 70 chars/segment (67 multi)" : "Max 160 chars/segment (153 multi)"}
          </div>
        </div>

        {isUnicode && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Unicode characters detected (emojis or special symbols):</strong> Telecom carrier networks reduce segment capacity from 160 to 70 characters. Use standard alphanumeric English to optimize segment billing costs.
            </p>
          </div>
        )}
      </div>

      {/* Merge Tag Chips */}
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[var(--brand-600)]" />
          <span className="text-xs font-extrabold text-[var(--text-primary)]">
            Personalization Tags (Click to Insert)
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {DEFAULT_SMS_MERGE_TAGS.map((item) => (
            <button
              key={item.tag}
              type="button"
              onClick={() => insertTag(item.tag)}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-purple-50 text-[var(--text-secondary)] hover:text-[var(--brand-700)] border border-slate-200/80 hover:border-purple-300 rounded-lg text-[11px] font-bold transition-all shadow-xs group disabled:opacity-50"
            >
              {item.tag === "{{shortUrl}}" ? (
                <LinkIcon className="w-3 h-3 text-[var(--brand-600)]" />
              ) : (
                <Plus className="w-3 h-3 text-slate-400 group-hover:text-[var(--brand-600)]" />
              )}
              <span>{item.label}</span>
              <code className="text-[10px] text-[var(--text-muted)] font-mono">({item.tag})</code>
            </button>
          ))}
        </div>
      </div>

      {/* TRAI / DLT Content Template ID Compliance */}
      {onDltTemplateIdChange && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <label
                htmlFor="dltTemplateId"
                className="text-xs font-extrabold text-[var(--text-primary)]"
              >
                DLT Content Template ID (India TRAI Compliance)
              </label>
            </div>
            <Badge variant="default" className="text-[10px]">
              Optional
            </Badge>
          </div>
          <input
            id="dltTemplateId"
            type="text"
            value={dltTemplateId || ""}
            onChange={(e) => onDltTemplateIdChange(e.target.value)}
            placeholder="e.g. 1107161234567890"
            disabled={disabled}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
          />
          <p className="text-[11px] font-medium text-[var(--text-muted)]">
            Required when dispatching promotional SMS via Indian telecom operator gateways (Jio, Airtel, Vodafone).
          </p>
        </div>
      )}
    </div>
  );
}
