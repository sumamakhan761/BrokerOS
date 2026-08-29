"use client";

import React from "react";
import { Sparkles, Plus } from "lucide-react";
import { DEFAULT_MERGE_TAGS } from "@brokeros/constants";

export interface EmailMergeTagSelectorProps {
  onInsertTag: (tag: string) => void;
}

export function EmailMergeTagSelector({ onInsertTag }: EmailMergeTagSelectorProps) {
  return (
    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-2 mb-2.5">
        <Sparkles className="w-3.5 h-3.5 text-[var(--brand-600)]" />
        <span className="text-xs font-extrabold text-[var(--text-primary)]">
          Personalization Tags (Click to Insert)
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {DEFAULT_MERGE_TAGS.map((item) => (
          <button
            key={item.tag}
            type="button"
            onClick={() => onInsertTag(item.tag)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-purple-50 text-[var(--text-secondary)] hover:text-[var(--brand-700)] border border-slate-200/80 hover:border-purple-300/80 rounded-lg text-[11px] font-bold transition-all shadow-xs group"
          >
            <Plus className="w-3 h-3 text-slate-400 group-hover:text-[var(--brand-600)]" />
            <span>{item.label}</span>
            <code className="text-[10px] text-[var(--text-muted)] font-mono">({item.tag})</code>
          </button>
        ))}
      </div>
    </div>
  );
}
