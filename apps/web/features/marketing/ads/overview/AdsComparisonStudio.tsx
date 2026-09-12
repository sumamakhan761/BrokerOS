"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  ArrowRight,
  Trophy,
  Zap,
  TrendingDown,
  TrendingUp,
  Percent,
  DollarSign,
  Users,
  MousePointerClick,
  Eye,
  Check,
  X,
  Sparkles,
  Scale,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Instagram } from "@/components/ui/InstagramIcon";
import { GoogleIcon } from "@/features/marketing/ads/google/components/GoogleIcon";
import { YouTubeIcon } from "@/features/marketing/ads/youtube/components/YouTubeIcon";

export interface NormalizedAdCampaign {
  id: string;
  name: string;
  platform: "FACEBOOK" | "INSTAGRAM" | "GOOGLE" | "YOUTUBE";
  status: string;
  spend: number;
  leadsCount: number;
  costPerLead: number;
  clicks: number;
  ctr: number;
  cpc: number;
  impressions: number;
  reach?: number;
  currency?: string;
}

interface AdsComparisonStudioProps {
  campaigns: NormalizedAdCampaign[];
  formatCurrency: (val: number, cur?: string) => string;
}

export function AdsComparisonStudio({
  campaigns,
  formatCurrency,
}: AdsComparisonStudioProps) {
  // Left Side (Variant A) Selection
  const [platformA, setPlatformA] = useState<string>("ALL");
  const [selectedIdsA, setSelectedIdsA] = useState<string[]>([]);

  // Right Side (Variant B) Selection
  const [platformB, setPlatformB] = useState<string>("ALL");
  const [selectedIdsB, setSelectedIdsB] = useState<string[]>([]);

  // Available campaigns filtered by platform
  const availableA = useMemo(() => {
    return campaigns.filter(
      (c) => platformA === "ALL" || c.platform === platformA
    );
  }, [campaigns, platformA]);

  const availableB = useMemo(() => {
    return campaigns.filter(
      (c) => platformB === "ALL" || c.platform === platformB
    );
  }, [campaigns, platformB]);

  // Aggregated Metrics for Variant A
  const metricsA = useMemo(() => {
    const selected = campaigns.filter((c) => selectedIdsA.includes(c.id));
    const spend = selected.reduce((sum, c) => sum + (c.spend || 0), 0);
    const leads = selected.reduce((sum, c) => sum + (c.leadsCount || 0), 0);
    const clicks = selected.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const impressions = selected.reduce(
      (sum, c) => sum + (c.impressions || 0),
      0
    );
    const cpl = leads > 0 ? spend / leads : 0;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;

    return {
      count: selected.length,
      spend,
      leads,
      clicks,
      impressions,
      cpl,
      ctr,
      cpc,
      selected,
    };
  }, [campaigns, selectedIdsA]);

  // Aggregated Metrics for Variant B
  const metricsB = useMemo(() => {
    const selected = campaigns.filter((c) => selectedIdsB.includes(c.id));
    const spend = selected.reduce((sum, c) => sum + (c.spend || 0), 0);
    const leads = selected.reduce((sum, c) => sum + (c.leadsCount || 0), 0);
    const clicks = selected.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const impressions = selected.reduce(
      (sum, c) => sum + (c.impressions || 0),
      0
    );
    const cpl = leads > 0 ? spend / leads : 0;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;

    return {
      count: selected.length,
      spend,
      leads,
      clicks,
      impressions,
      cpl,
      ctr,
      cpc,
      selected,
    };
  }, [campaigns, selectedIdsB]);

  // Winner Calculations
  const cplWinner = useMemo(() => {
    if (metricsA.leads === 0 || metricsB.leads === 0) return null;
    if (metricsA.cpl < metricsB.cpl) {
      const diffPct = Math.round(
        ((metricsB.cpl - metricsA.cpl) / (metricsB.cpl || 1)) * 100
      );
      return { winner: "A", diffPct };
    }
    if (metricsB.cpl < metricsA.cpl) {
      const diffPct = Math.round(
        ((metricsA.cpl - metricsB.cpl) / (metricsA.cpl || 1)) * 100
      );
      return { winner: "B", diffPct };
    }
    return { winner: "TIE", diffPct: 0 };
  }, [metricsA, metricsB]);

  const ctrWinner = useMemo(() => {
    if (metricsA.impressions === 0 || metricsB.impressions === 0) return null;
    if (metricsA.ctr > metricsB.ctr) {
      const diffPct = Math.round(
        ((metricsA.ctr - metricsB.ctr) / (metricsB.ctr || 1)) * 100
      );
      return { winner: "A", diffPct };
    }
    if (metricsB.ctr > metricsA.ctr) {
      const diffPct = Math.round(
        ((metricsB.ctr - metricsA.ctr) / (metricsA.ctr || 1)) * 100
      );
      return { winner: "B", diffPct };
    }
    return { winner: "TIE", diffPct: 0 };
  }, [metricsA, metricsB]);

  const leadsWinner = useMemo(() => {
    if (metricsA.leads === metricsB.leads) return null;
    return metricsA.leads > metricsB.leads ? "A" : "B";
  }, [metricsA.leads, metricsB.leads]);

  // Preset Shortcuts
  const handleApplyPreset = (preset: "TOP_META" | "META_VS_GOOGLE") => {
    if (preset === "TOP_META") {
      const metaCamps = campaigns.filter(
        (c) => c.platform === "FACEBOOK" || c.platform === "INSTAGRAM"
      );
      if (metaCamps.length >= 2) {
        setPlatformA("FACEBOOK");
        setSelectedIdsA([metaCamps[0].id]);
        setPlatformB("FACEBOOK");
        setSelectedIdsB([metaCamps[1].id]);
      }
    } else if (preset === "META_VS_GOOGLE") {
      const metaCamps = campaigns.filter(
        (c) => c.platform === "FACEBOOK" || c.platform === "INSTAGRAM"
      );
      const googleCamps = campaigns.filter(
        (c) => c.platform === "GOOGLE" || c.platform === "YOUTUBE"
      );
      if (metaCamps.length > 0 && googleCamps.length > 0) {
        setPlatformA("FACEBOOK");
        setSelectedIdsA([metaCamps[0].id]);
        setPlatformB("GOOGLE");
        setSelectedIdsB([googleCamps[0].id]);
      }
    }
  };

  const renderPlatformBadge = (platform: string) => {
    switch (platform) {
      case "INSTAGRAM":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-pink-50 text-pink-700 border border-pink-200">
            <Instagram size={11} />
            <span>Instagram</span>
          </span>
        );
      case "GOOGLE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
            <GoogleIcon size={11} />
            <span>Google</span>
          </span>
        );
      case "YOUTUBE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
            <YouTubeIcon size={11} />
            <span>YouTube</span>
          </span>
        );
      case "FACEBOOK":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span>Meta / Facebook</span>
          </span>
        );
    }
  };

  const hasBothSelected = metricsA.count > 0 && metricsB.count > 0;

  return (
    <div className="space-y-6 animate-enter">
      {/* ── Preset Action Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>A/B Testing & Campaign Comparison Studio</span>
          </h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
            Select campaigns on the left and right to run comparative performance analytics on Spend, Leads, and Cost Per Lead.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleApplyPreset("TOP_META")}
            className="text-xs font-bold text-slate-700"
          >
            Compare Top 2 Meta
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleApplyPreset("META_VS_GOOGLE")}
            className="text-xs font-bold text-blue-700 border-blue-200 bg-blue-50/50 hover:bg-blue-50"
          >
            Compare Meta vs Google
          </Button>
        </div>
      </div>

      {/* ── Dual Side-by-Side Variant Selection Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* VARIANT A (LEFT) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                A
              </span>
              <h4 className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider">
                Variant A (Benchmark)
              </h4>
            </div>
            <Badge variant="brand" className="text-[10px]">
              {metricsA.count} Campaign{metricsA.count === 1 ? "" : "s"} Selected
            </Badge>
          </div>

          {/* Platform Filter */}
          <div>
            <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">
              Select Ad Platform
            </label>
            <div className="flex flex-wrap gap-1.5">
              {["ALL", "FACEBOOK", "INSTAGRAM", "GOOGLE", "YOUTUBE"].map(
                (p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatformA(p)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all",
                      platformA === p
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {p === "ALL" ? "All Platforms" : p}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Campaign Picker Dropdown */}
          <div>
            <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">
              Add Campaign to Variant A
            </label>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value && !selectedIdsA.includes(e.target.value)) {
                  setSelectedIdsA([...selectedIdsA, e.target.value]);
                }
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- Choose a campaign to add --</option>
              {availableA.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.platform}] {c.name} ({formatCurrency(c.spend || 0)} spend · {c.leadsCount} leads)
                </option>
              ))}
            </select>
          </div>

          {/* Selected Campaign Chips */}
          <div className="space-y-2 pt-1">
            {metricsA.selected.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No campaigns selected yet for Variant A.
              </p>
            ) : (
              metricsA.selected.map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    {renderPlatformBadge(c.platform)}
                    <div>
                      <div className="font-bold text-slate-900 truncate max-w-[200px]">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {formatCurrency(c.spend || 0)} · {c.leadsCount} leads (₹{Math.round(c.costPerLead || 0)} CPL)
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedIdsA(selectedIdsA.filter((id) => id !== c.id))
                    }
                    className="w-5 h-5 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* VARIANT B (RIGHT) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                B
              </span>
              <h4 className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider">
                Variant B (Challenger)
              </h4>
            </div>
            <Badge variant="brand" className="text-[10px]">
              {metricsB.count} Campaign{metricsB.count === 1 ? "" : "s"} Selected
            </Badge>
          </div>

          {/* Platform Filter */}
          <div>
            <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">
              Select Ad Platform
            </label>
            <div className="flex flex-wrap gap-1.5">
              {["ALL", "FACEBOOK", "INSTAGRAM", "GOOGLE", "YOUTUBE"].map(
                (p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatformB(p)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all",
                      platformB === p
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {p === "ALL" ? "All Platforms" : p}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Campaign Picker Dropdown */}
          <div>
            <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">
              Add Campaign to Variant B
            </label>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value && !selectedIdsB.includes(e.target.value)) {
                  setSelectedIdsB([...selectedIdsB, e.target.value]);
                }
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Choose a campaign to add --</option>
              {availableB.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.platform}] {c.name} ({formatCurrency(c.spend || 0)} spend · {c.leadsCount} leads)
                </option>
              ))}
            </select>
          </div>

          {/* Selected Campaign Chips */}
          <div className="space-y-2 pt-1">
            {metricsB.selected.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No campaigns selected yet for Variant B.
              </p>
            ) : (
              metricsB.selected.map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    {renderPlatformBadge(c.platform)}
                    <div>
                      <div className="font-bold text-slate-900 truncate max-w-[200px]">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {formatCurrency(c.spend || 0)} · {c.leadsCount} leads (₹{Math.round(c.costPerLead || 0)} CPL)
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedIdsB(selectedIdsB.filter((id) => id !== c.id))
                    }
                    className="w-5 h-5 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── System Verdict Banner (When Both Selected) ── */}
      {hasBothSelected && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white shadow-md space-y-2 border border-emerald-900/40">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-400">
            <Trophy className="w-4 h-4" />
            <span>Automated Performance Verdict</span>
          </div>
          <div className="text-sm font-extrabold">
            {cplWinner?.winner === "A" && (
              <span>
                Variant A is the clear winner on Cost-Efficiency, delivering leads at{" "}
                <span className="text-emerald-300 font-black">
                  ₹{Math.round(metricsA.cpl)} CPL
                </span>{" "}
                ({cplWinner.diffPct}% cheaper than Variant B at ₹{Math.round(metricsB.cpl)}).
              </span>
            )}
            {cplWinner?.winner === "B" && (
              <span>
                Variant B is the clear winner on Cost-Efficiency, delivering leads at{" "}
                <span className="text-emerald-300 font-black">
                  ₹{Math.round(metricsB.cpl)} CPL
                </span>{" "}
                ({cplWinner.diffPct}% cheaper than Variant A at ₹{Math.round(metricsA.cpl)}).
              </span>
            )}
            {cplWinner?.winner === "TIE" && (
              <span>Both variants are performing at identical Cost Per Lead efficiency.</span>
            )}
          </div>
          <p className="text-xs text-slate-300 font-medium">
            {ctrWinner && (
              <span>
                Engagement Winner: Variant {ctrWinner.winner} achieved a higher Click-Through Rate ({ctrWinner.winner === "A" ? metricsA.ctr.toFixed(2) : metricsB.ctr.toFixed(2)}% vs {ctrWinner.winner === "A" ? metricsB.ctr.toFixed(2) : metricsA.ctr.toFixed(2)}%).
              </span>
            )}
          </p>
        </div>
      )}

      {/* ── Head-to-Head Comparison Table & Metrics ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider">
            Head-to-Head Metric Scorecard
          </h4>
          <span className="text-xs text-slate-500 font-medium">
            Comparing {metricsA.count} vs {metricsB.count} campaigns
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-5">Ad Metric</th>
                <th className="py-3 px-5 text-right bg-emerald-50/30 text-emerald-900">
                  Variant A
                </th>
                <th className="py-3 px-5 text-right bg-blue-50/30 text-blue-900">
                  Variant B
                </th>
                <th className="py-3 px-5 text-center">Efficiency Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Total Spend */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-5 font-extrabold text-slate-800 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                  <span>Total Ad Spend</span>
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900 bg-emerald-50/20">
                  {formatCurrency(metricsA.spend)}
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900 bg-blue-50/20">
                  {formatCurrency(metricsB.spend)}
                </td>
                <td className="py-3.5 px-5 text-center text-slate-500 font-mono">
                  {metricsA.spend !== metricsB.spend
                    ? `${formatCurrency(Math.abs(metricsA.spend - metricsB.spend))} diff`
                    : "Even"}
                </td>
              </tr>

              {/* Leads Acquired */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-5 font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Leads Acquired</span>
                </td>
                <td className="py-3.5 px-5 text-right font-bold text-slate-900 bg-emerald-50/20">
                  {metricsA.leads.toLocaleString()}
                  {leadsWinner === "A" && (
                    <span className="ml-1.5 text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                      +{(metricsA.leads - metricsB.leads).toLocaleString()}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-5 text-right font-bold text-slate-900 bg-blue-50/20">
                  {metricsB.leads.toLocaleString()}
                  {leadsWinner === "B" && (
                    <span className="ml-1.5 text-[10px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                      +{(metricsB.leads - metricsA.leads).toLocaleString()}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-5 text-center font-bold">
                  {hasBothSelected && (
                    <span
                      className={
                        leadsWinner === "A"
                          ? "text-emerald-600"
                          : leadsWinner === "B"
                          ? "text-blue-600"
                          : "text-slate-500"
                      }
                    >
                      {leadsWinner ? `Variant ${leadsWinner} leads by volume` : "Tied"}
                    </span>
                  )}
                </td>
              </tr>

              {/* Cost Per Lead (CPL) */}
              <tr className="hover:bg-slate-50/50 transition-colors bg-amber-50/30">
                <td className="py-3.5 px-5 font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-600" />
                  <span>Cost Per Lead (CPL)</span>
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-extrabold text-slate-900 bg-emerald-50/40">
                  ₹{Math.round(metricsA.cpl).toLocaleString()}
                  {cplWinner?.winner === "A" && (
                    <span className="ml-1.5 text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      WINNER (-{cplWinner.diffPct}%)
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-extrabold text-slate-900 bg-blue-50/40">
                  ₹{Math.round(metricsB.cpl).toLocaleString()}
                  {cplWinner?.winner === "B" && (
                    <span className="ml-1.5 text-[10px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      WINNER (-{cplWinner.diffPct}%)
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-5 text-center font-extrabold">
                  {cplWinner && cplWinner.winner !== "TIE" && (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                      Variant {cplWinner.winner} saves {cplWinner.diffPct}% on cost
                    </span>
                  )}
                </td>
              </tr>

              {/* Click-Through Rate (CTR) */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-5 font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-slate-500" />
                  <span>Click-Through Rate (CTR)</span>
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900 bg-emerald-50/20">
                  {metricsA.ctr.toFixed(2)}%
                  {ctrWinner?.winner === "A" && (
                    <span className="ml-1.5 text-[10px] font-bold text-emerald-700">
                      🏆 Winner
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900 bg-blue-50/20">
                  {metricsB.ctr.toFixed(2)}%
                  {ctrWinner?.winner === "B" && (
                    <span className="ml-1.5 text-[10px] font-bold text-blue-700">
                      🏆 Winner
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-5 text-center font-mono text-slate-500">
                  {Math.abs(metricsA.ctr - metricsB.ctr).toFixed(2)}% difference
                </td>
              </tr>

              {/* Total Clicks */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-5 font-extrabold text-slate-800 flex items-center gap-1.5">
                  <MousePointerClick className="w-3.5 h-3.5 text-slate-500" />
                  <span>Clicks</span>
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900 bg-emerald-50/20">
                  {metricsA.clicks.toLocaleString()}
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900 bg-blue-50/20">
                  {metricsB.clicks.toLocaleString()}
                </td>
                <td className="py-3.5 px-5 text-center font-mono text-slate-500">
                  {Math.abs(metricsA.clicks - metricsB.clicks).toLocaleString()} clicks
                </td>
              </tr>

              {/* Average CPC */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-5 font-extrabold text-slate-800 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cost Per Click (CPC)</span>
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900 bg-emerald-50/20">
                  ₹{metricsA.cpc.toFixed(2)}
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900 bg-blue-50/20">
                  ₹{metricsB.cpc.toFixed(2)}
                </td>
                <td className="py-3.5 px-5 text-center font-mono text-slate-500">
                  ₹{Math.abs(metricsA.cpc - metricsB.cpc).toFixed(2)} delta
                </td>
              </tr>

              {/* Impressions */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-5 font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Impressions</span>
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900 bg-emerald-50/20">
                  {metricsA.impressions.toLocaleString()}
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900 bg-blue-50/20">
                  {metricsB.impressions.toLocaleString()}
                </td>
                <td className="py-3.5 px-5 text-center font-mono text-slate-500">
                  {Math.abs(metricsA.impressions - metricsB.impressions).toLocaleString()} views
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
