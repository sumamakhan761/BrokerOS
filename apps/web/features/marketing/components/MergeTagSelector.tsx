"use client";

import React from "react";
import { Sparkles, Plus } from "lucide-react";
import { DEFAULT_MERGE_TAGS } from "@brokeros/constants";

interface MergeTagSelectorProps {
  onInsertTag: (tag: string) => void;
}

export function MergeTagSelector({ onInsertTag }: MergeTagSelectorProps) {
  return (
    <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200/80 dark:border-zinc-700/80">
      <div className="flex items-center gap-2 mb-2.5">
        <Sparkles className="w-3.5 h-3.5 text-sky-500" />
        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
          Personalization Tags (Click to Insert)
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {DEFAULT_MERGE_TAGS.map((item) => (
          <button
            key={item.tag}
            type="button"
            onClick={() => onInsertTag(item.tag)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-zinc-900 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-700 dark:text-zinc-300 hover:text-sky-700 dark:hover:text-sky-300 border border-slate-200 dark:border-zinc-700 rounded-md text-[11px] font-medium transition-all shadow-2xs group"
          >
            <Plus className="w-3 h-3 text-slate-400 group-hover:text-sky-500" />
            <span>{item.label}</span>
            <code className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">({item.tag})</code>
          </button>
        ))}
      </div>
    </div>
  );
}
