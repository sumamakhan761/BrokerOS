"use client";

import React from "react";
import { Award, Zap, Sparkles } from "lucide-react";
import { GOOGLE_QUALITY_SCORE_CONFIG } from "@brokeros/constants";

interface GoogleQualityScoreWidgetProps {
  excellentCount?: number;
  moderateCount?: number;
  poorCount?: number;
  avgScore?: number;
}

export function GoogleQualityScoreWidget({
  excellentCount = 0,
  moderateCount = 0,
  poorCount = 0,
  avgScore,
}: GoogleQualityScoreWidgetProps) {
  const total = excellentCount + moderateCount + poorCount;
  const excellentPct = total > 0 ? Math.round((excellentCount / total) * 100) : 0;
  const moderatePct = total > 0 ? Math.round((moderateCount / total) * 100) : 0;
  const poorPct = total > 0 ? 100 - excellentPct - moderatePct : 0;

  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-amber-500 to-emerald-500" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold shadow-xs">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                Google Ads Quality Score Index
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200/80">
                {total > 0 && avgScore
                  ? `Avg: ${avgScore.toFixed(1)} / 10`
                  : total > 0
                  ? "Active"
                  : "Sync to Calculate"}
              </span>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
              Evaluates Expected CTR, Ad Relevance, and Real Estate Landing Page Experience.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-200/80">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>
            High Quality Scores reduce CPC by up to{" "}
            <strong className="text-[var(--text-primary)] font-extrabold">50%</strong>
          </span>
        </div>
      </div>

      {/* Visual Multi-Segment Progress Bar */}
      <div className="space-y-2.5">
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          {total > 0 ? (
            <>
              <div
                style={{ width: `${excellentPct}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Excellent (8-10): ${excellentCount} keywords (${excellentPct}%)`}
              />
              <div
                style={{ width: `${moderatePct}%` }}
                className="bg-amber-500 transition-all duration-500"
                title={`Moderate (5-7): ${moderateCount} keywords (${moderatePct}%)`}
              />
              <div
                style={{ width: `${poorPct}%` }}
                className="bg-rose-500 transition-all duration-500"
                title={`Below Average (1-4): ${poorCount} keywords (${poorPct}%)`}
              />
            </>
          ) : (
            <div className="w-full bg-slate-200/60 rounded-full" />
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-800">
                Score {GOOGLE_QUALITY_SCORE_CONFIG.EXCELLENT.range} ({GOOGLE_QUALITY_SCORE_CONFIG.EXCELLENT.label})
              </span>
            </div>
            <span className="text-xs font-black text-emerald-700">
              {excellentCount} ({excellentPct}%)
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-slate-800">
                Score {GOOGLE_QUALITY_SCORE_CONFIG.AVERAGE.range} ({GOOGLE_QUALITY_SCORE_CONFIG.AVERAGE.label})
              </span>
            </div>
            <span className="text-xs font-black text-amber-700">
              {moderateCount} ({moderatePct}%)
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/50 border border-rose-200/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-xs font-bold text-slate-800">
                Score {GOOGLE_QUALITY_SCORE_CONFIG.POOR.range} ({GOOGLE_QUALITY_SCORE_CONFIG.POOR.label})
              </span>
            </div>
            <span className="text-xs font-black text-rose-700">
              {poorCount} ({poorPct}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
