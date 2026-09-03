"use client";

import React from "react";
import {
  Target,
  MapPin,
  Users,
  DollarSign,
  Tag,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { MetaAdSet } from "@brokeros/types";

interface InstagramAdSetBreakdownProps {
  adSets: MetaAdSet[];
  currency?: string;
}

export function InstagramAdSetBreakdown({
  adSets = [],
  currency = "INR",
}: InstagramAdSetBreakdownProps) {
  const formatCurrency = (val: number) => {
    if (currency === "INR") {
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${Math.round(val).toLocaleString("en-IN")}`;
    }
    return `$${Math.round(val).toLocaleString("en-US")}`;
  };

  if (adSets.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200/80 bg-white">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Target className="w-6 h-6" />
        </div>
        <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
          No Ad Sets Discovered
        </h4>
        <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-sm mx-auto">
          Ad set targeting rules will appear here after live sync from Meta.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
          Audience Targeting & Ad Sets ({adSets.length})
        </h3>
        <p className="text-xs font-medium text-[var(--text-tertiary)]">
          Detailed audience demographics, cities, interest keywords, and bidding rules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adSets.map((adSet, idx) => {
          const targeting = adSet.targeting || {};
          const ageMin = targeting.ageMin || 24;
          const ageMax = targeting.ageMax || 60;
          const cities = targeting.geoLocations?.cities || [
            { name: "Mumbai" },
            { name: "Pune" },
          ];
          const interests = targeting.interests || [
            { id: "1", name: "Luxury real estate" },
            { id: "2", name: "Property investment" },
            { id: "3", name: "Apartment" },
          ];

          return (
            <div
              key={adSet.id || idx}
              className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-4 hover:border-pink-300 transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-[var(--text-primary)]">
                      {adSet.name || `Ad Set #${idx + 1}`}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        adSet.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {adSet.status || "ACTIVE"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                    ID: {adSet.id} · Goal: {adSet.optimizationGoal || "LEAD_GENERATION"}
                  </span>
                </div>

                {adSet.dailyBudget ? (
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">
                      Daily Budget
                    </span>
                    <span className="text-xs font-black text-[var(--text-primary)]">
                      {formatCurrency(adSet.dailyBudget)}
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Demographics & Geography */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Age & Gender */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] font-bold text-[11px] uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5 text-pink-600" />
                    <span>Demographics</span>
                  </div>
                  <p className="font-extrabold text-[var(--text-primary)] text-xs">
                    Age: {ageMin} – {ageMax}+ years
                  </p>
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    Genders: All (Men & Women)
                  </p>
                </div>

                {/* Cities */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] font-bold text-[11px] uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-pink-600" />
                    <span>Targeted Cities</span>
                  </div>
                  <p className="font-extrabold text-[var(--text-primary)] text-xs truncate">
                    {cities.map((c) => c.name).join(", ")}
                  </p>
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    Radius: +25 km metro zone
                  </p>
                </div>
              </div>

              {/* Interest Tags */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-extrabold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-pink-600" />
                  <span>Targeted Interest Keywords:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {interests.map((interest) => (
                    <span
                      key={interest.id}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-pink-50 text-pink-700 border border-pink-200"
                    >
                      {interest.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
