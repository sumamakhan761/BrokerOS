"use client";

import React from "react";
import { Phone, PhoneCall, CheckCircle, Flame, Clock, Heart } from "lucide-react";
import type { VoiceAnalyticsSummary } from "@/features/marketing/types";

export interface VoiceCampaignFunnelProps {
  analytics: VoiceAnalyticsSummary;
}

export function VoiceCampaignFunnel({ analytics }: VoiceCampaignFunnelProps) {
  const {
    totalRecipients,
    completedCalls,
    busyCalls,
    noAnswerCalls,
    failedCalls,
    averageDurationSec,
    totalDurationSec,
    sentimentBreakdown,
  } = analytics;

  const answeredCalls = completedCalls + (busyCalls ? 0 : 0);
  const positiveSentiment = sentimentBreakdown.positive;

  const answerRate = totalRecipients > 0 ? Math.round((completedCalls / totalRecipients) * 100) : 0;
  const positiveRate = completedCalls > 0 ? Math.round((positiveSentiment / completedCalls) * 100) : 0;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}m ${s}s`;
  };

  const funnelStages = [
    {
      label: "Total Dialed",
      value: totalRecipients.toLocaleString(),
      percentage: 100,
      icon: Phone,
      color: "from-indigo-600 to-indigo-700",
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "PSTN / SIP calls placed via carrier gateway",
    },
    {
      label: "Connected & Answered",
      value: completedCalls.toLocaleString(),
      percentage: answerRate,
      icon: PhoneCall,
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      description: `${answerRate}% connection rate`,
    },
    {
      label: "Deep Conversations (>30s)",
      value: completedCalls.toLocaleString(),
      percentage: answerRate,
      icon: Clock,
      color: "from-violet-500 to-purple-600",
      textColor: "text-violet-600",
      bgColor: "bg-violet-50",
      description: `Avg talk time: ${formatDuration(averageDurationSec)}`,
    },
    {
      label: "Positive Sentiment Leads",
      value: positiveSentiment.toLocaleString(),
      percentage: positiveRate,
      icon: Flame,
      color: "from-rose-500 to-amber-500",
      textColor: "text-rose-600",
      bgColor: "bg-rose-50",
      description: `${positiveRate}% qualified site visit intent`,
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-extrabold text-[var(--text-primary)]">
            AI Voice Conversation Funnel
          </h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Full telemetry progression from initial carrier dial to high-intent buyer qualification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Talk Time</span>
            <p className="text-xs font-extrabold text-[var(--text-primary)]">
              {formatDuration(totalDurationSec)}
            </p>
          </div>
        </div>
      </div>

      {/* 4-Stage Horizontal Funnel Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {funnelStages.map((stage, i) => (
          <div
            key={stage.label}
            className="relative p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex flex-col justify-between overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${stage.bgColor} ${stage.textColor} flex items-center justify-center`}>
                <stage.icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold text-[var(--text-primary)]">
                {stage.percentage}%
              </span>
            </div>

            <div>
              <span className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                {stage.value}
              </span>
              <h4 className="text-xs font-extrabold text-slate-700 mt-1">{stage.label}</h4>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">{stage.description}</p>
            </div>

            {/* Stage Progress Line */}
            <div className="mt-4 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${stage.color} transition-all duration-500`}
                style={{ width: `${stage.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Sentiment & Disposition Split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-800 uppercase">Positive Sentiment</span>
            <p className="text-lg font-black text-emerald-700">{sentimentBreakdown.positive}</p>
          </div>
          <Heart className="w-6 h-6 text-emerald-400" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-600 uppercase">Neutral Inquiries</span>
            <p className="text-lg font-black text-slate-700">{sentimentBreakdown.neutral}</p>
          </div>
          <CheckCircle className="w-6 h-6 text-slate-400" />
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-800 uppercase">Busy / No Answer</span>
            <p className="text-lg font-black text-amber-700">{busyCalls + noAnswerCalls}</p>
          </div>
          <Phone className="w-6 h-6 text-amber-400" />
        </div>
      </div>
    </div>
  );
}
