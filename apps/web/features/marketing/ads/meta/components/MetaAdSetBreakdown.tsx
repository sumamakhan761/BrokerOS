"use client";

import React from "react";
import { Target, MapPin, Users, DollarSign } from "lucide-react";

interface AdSetItem {
  id: string;
  name: string;
  status: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  optimizationGoal?: string;
  targeting?: {
    ageMin?: number;
    ageMax?: number;
    geoLocations?: {
      cities?: Array<{ name: string }>;
      countries?: string[];
    };
    interests?: Array<{ name: string }>;
  };
  insights?: {
    spend: number;
    impressions: number;
    clicks: number;
    leadsCount: number;
    costPerLead: number;
    ctr: number;
  };
}

interface MetaAdSetBreakdownProps {
  adSets: AdSetItem[];
  currency?: string;
}

export function MetaAdSetBreakdown({ adSets, currency = "INR" }: MetaAdSetBreakdownProps) {
  if (!adSets || adSets.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 mb-2">
          <Target className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No Ad Sets Cached</p>
        <p className="text-[11px] text-zinc-400 mt-0.5">
          Sync this campaign to inspect audience targeting profiles and placements.
        </p>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    if (currency === "INR") {
      return `₹${Math.round(val).toLocaleString("en-IN")}`;
    }
    return `$${Math.round(val).toLocaleString("en-US")}`;
  };

  return (
    <div className="space-y-3">
      {adSets.map((adSet, idx) => {
        const geo = adSet.targeting?.geoLocations;
        const cities = geo?.cities?.map((c) => c.name).join(", ") || geo?.countries?.join(", ") || "All Locations";
        const ageRange =
          adSet.targeting?.ageMin || adSet.targeting?.ageMax
            ? `${adSet.targeting.ageMin || "18"} - ${adSet.targeting.ageMax || "65+"} yrs`
            : "All Ages";
        const interests = adSet.targeting?.interests?.map((i) => i.name).slice(0, 4).join(", ");
        const insights = adSet.insights || { spend: 0, impressions: 0, clicks: 0, leadsCount: 0, costPerLead: 0, ctr: 0 };

        return (
          <div
            key={adSet.id || idx}
            className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {adSet.name}
                </h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {adSet.optimizationGoal || "LEAD_GENERATION"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-500" />
                  {cities}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3 h-3 text-purple-500" />
                  {ageRange}
                </span>
                {interests && (
                  <span className="inline-flex items-center gap-1">
                    <Target className="w-3 h-3 text-emerald-500" />
                    Interests: {interests}
                  </span>
                )}
              </div>
            </div>

            {/* Performance Stats */}
            <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800 pt-3 md:pt-0 md:pl-6 w-full md:w-auto justify-between md:justify-end">
              <div className="text-left md:text-right">
                <span className="text-[10px] text-zinc-400 block font-medium">Spend</span>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(insights.spend)}
                </span>
              </div>

              <div className="text-left md:text-right">
                <span className="text-[10px] text-zinc-400 block font-medium">Leads</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {insights.leadsCount}
                </span>
              </div>

              <div className="text-left md:text-right">
                <span className="text-[10px] text-zinc-400 block font-medium">CPL</span>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {insights.leadsCount > 0 ? formatCurrency(insights.costPerLead) : "—"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
