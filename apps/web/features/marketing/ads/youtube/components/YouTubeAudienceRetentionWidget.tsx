'use client';

import React from 'react';
import { Video, Flame, Sparkles, HelpCircle } from 'lucide-react';
import { YOUTUBE_RETENTION_THRESHOLDS } from '@brokeros/constants';
import type { YouTubeRetentionProfile } from '../types';

interface YouTubeAudienceRetentionWidgetProps {
  retention?: YouTubeRetentionProfile;
  totalViews?: number;
}

export function YouTubeAudienceRetentionWidget({
  retention = {
    quartile25: 68.5,
    quartile50: 45.2,
    quartile75: 31.0,
    quartile100: 19.4,
  },
  totalViews = 0,
}: YouTubeAudienceRetentionWidgetProps) {
  const stages = [
    {
      key: 'QUARTILE_25',
      label: YOUTUBE_RETENTION_THRESHOLDS.QUARTILE_25.label,
      pct: retention.quartile25,
      benchmark: YOUTUBE_RETENTION_THRESHOLDS.QUARTILE_25.benchmarkPct,
      desc: YOUTUBE_RETENTION_THRESHOLDS.QUARTILE_25.description,
      barColor: 'bg-rose-500',
      textColor: 'text-rose-700',
      bgColor: 'bg-rose-50/60',
      borderColor: 'border-rose-200/70',
    },
    {
      key: 'QUARTILE_50',
      label: YOUTUBE_RETENTION_THRESHOLDS.QUARTILE_50.label,
      pct: retention.quartile50,
      benchmark: YOUTUBE_RETENTION_THRESHOLDS.QUARTILE_50.benchmarkPct,
      desc: YOUTUBE_RETENTION_THRESHOLDS.QUARTILE_50.description,
      barColor: 'bg-amber-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50/60',
      borderColor: 'border-amber-200/70',
    },
    {
      key: 'QUARTILE_75',
      label: YOUTUBE_RETENTION_THRESHOLDS.QUARTILE_75.label,
      pct: retention.quartile75,
      benchmark: YOUTUBE_RETENTION_THRESHOLDS.QUARTILE_75.benchmarkPct,
      desc: YOUTUBE_RETENTION_THRESHOLDS.QUARTILE_75.description,
      barColor: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50/60',
      borderColor: 'border-blue-200/70',
    },
    {
      key: 'QUARTILE_100',
      label: YOUTUBE_RETENTION_THRESHOLDS.QUARTILE_100.label,
      pct: retention.quartile100,
      benchmark: YOUTUBE_RETENTION_THRESHOLDS.QUARTILE_100.benchmarkPct,
      desc: YOUTUBE_RETENTION_THRESHOLDS.QUARTILE_100.description,
      barColor: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50/60',
      borderColor: 'border-emerald-200/70',
    },
  ];

  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-extrabold shadow-xs">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                YouTube Property Tour Retention Funnel
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md border border-rose-200/80">
                Audience Watch-Time Curve
              </span>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
              Tracks drop-off points during 4K property walkthroughs & drone videos to optimize video CTA timing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-slate-50/80 px-3 py-1.5 rounded-xl border border-slate-200/80">
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          <span>
            Viewers completing <strong className="text-[var(--text-primary)] font-extrabold">100%</strong> convert at 4.8x higher rate
          </span>
        </div>
      </div>

      {/* 4-Stage Retention Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stages.map((stg) => (
          <div
            key={stg.key}
            className={`p-4 rounded-xl border ${stg.borderColor} ${stg.bgColor} transition-all relative flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">{stg.label}</span>
                <span className={`text-base font-black ${stg.textColor}`}>
                  {stg.pct}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-white/80 rounded-full overflow-hidden shadow-inner mb-2.5">
                <div
                  style={{ width: `${Math.min(stg.pct, 100)}%` }}
                  className={`h-full ${stg.barColor} transition-all duration-700 rounded-full`}
                />
              </div>
            </div>

            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
              {stg.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
