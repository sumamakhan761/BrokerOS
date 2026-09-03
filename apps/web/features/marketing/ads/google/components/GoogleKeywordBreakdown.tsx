"use client";

import React, { useState } from "react";
import { Search, Sparkles, Layers } from "lucide-react";
import type { GoogleKeywordItem } from "../types";
import { GOOGLE_MATCH_TYPE_CONFIG } from "@brokeros/constants";

interface GoogleKeywordBreakdownProps {
  keywords: GoogleKeywordItem[];
  currency?: string;
}

export function GoogleKeywordBreakdown({
  keywords,
  currency = "INR",
}: GoogleKeywordBreakdownProps) {
  const [filterText, setFilterText] = useState("");

  const filtered = keywords.filter((kw) =>
    kw.text.toLowerCase().includes(filterText.toLowerCase()),
  );

  const formatCurrency = (val: number) => {
    if (currency === "INR" || currency === "₹") {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${Math.round(val).toLocaleString("en-IN")}`;
    }
    return `$${Math.round(val).toLocaleString("en-US")}`;
  };

  const getQualityScoreBadge = (score?: number) => {
    if (!score) return <span className="text-[var(--text-tertiary)] font-bold">N/A</span>;
    if (score >= 8) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          {score}/10 High
        </span>
      );
    }
    if (score >= 5) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
          {score}/10 Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
        {score}/10 Low
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div>
          <h3 className="font-extrabold text-[var(--text-primary)] text-sm tracking-tight">
            High-Intent Search Keywords & Quality Scores ({filtered.length})
          </h3>
          <p className="text-xs text-[var(--text-tertiary)] font-medium mt-0.5">
            Real search queries entered by property buyers on Google.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search keywords..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-500)]/20 focus:border-[var(--brand-500)] transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-tertiary)]">
              <th className="py-3 px-4">Search Keyword</th>
              <th className="py-3 px-4">Match Type</th>
              <th className="py-3 px-4">Quality Score</th>
              <th className="py-3 px-4">Clicks</th>
              <th className="py-3 px-4">Impressions</th>
              <th className="py-3 px-4">Avg CPC</th>
              <th className="py-3 px-4 text-right">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Layers className="w-6 h-6 text-slate-300 mb-1" />
                    <span className="font-medium text-xs text-[var(--text-tertiary)]">
                      No matching keywords found.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((kw, i) => {
                const matchConf =
                  GOOGLE_MATCH_TYPE_CONFIG[
                    kw.matchType as keyof typeof GOOGLE_MATCH_TYPE_CONFIG
                  ] || GOOGLE_MATCH_TYPE_CONFIG.EXACT;

                return (
                  <tr
                    key={kw.id || i}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[var(--text-primary)]">
                      {matchConf.syntax.replace("keyword", kw.text)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold border ${matchConf.badgeClass}`}
                      >
                        {matchConf.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getQualityScoreBadge(kw.qualityScore)}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-primary)] font-bold">
                      {kw.clicks.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                      {kw.impressions.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-primary)] font-semibold">
                      ₹{kw.cpc.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-[var(--text-primary)]">
                      {formatCurrency(kw.cost)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
