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
      <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200/80">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto text-blue-600 mb-2 shadow-xs">
          <Target className="w-6 h-6" />
        </div>
        <p className="text-xs font-extrabold text-[var(--text-primary)]">No Ad Sets Cached</p>
        <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
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
            className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 transition-all"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
                  {adSet.name}
                </h4>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                  {adSet.optimizationGoal || "LEAD_GENERATION"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {cities}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  {ageRange}
                </span>
                {interests && (
                  <span className="inline-flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-emerald-600" />
                    Interests: {interests}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-between md:justify-end">
              <div>
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">Spend</span>
                <span className="font-extrabold text-[var(--text-primary)]">{formatCurrency(insights.spend)}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">Leads</span>
                <span className="font-extrabold text-emerald-600">{insights.leadsCount.toLocaleString()}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">CPL</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {insights.leadsCount > 0 ? formatCurrency(insights.costPerLead) : "—"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">CTR</span>
                <span className="font-medium text-[var(--text-secondary)]">{insights.ctr ? `${insights.ctr.toFixed(1)}%` : "0%"}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
