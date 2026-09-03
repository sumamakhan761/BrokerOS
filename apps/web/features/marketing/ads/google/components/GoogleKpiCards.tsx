"use client";

import React from "react";
import {
  TrendingUp,
  Target,
  DollarSign,
  Search,
  MousePointerClick,
  Sparkles,
} from "lucide-react";
import type { GoogleKpiSummary } from "../types";

interface GoogleKpiCardsProps {
  kpis: GoogleKpiSummary;
  currency?: string;
}

export function GoogleKpiCards({ kpis, currency = "INR" }: GoogleKpiCardsProps) {
  const formatCurrency = (val: number) => {
    if (currency === "INR" || currency === "₹") {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${Math.round(val).toLocaleString("en-IN")}`;
    }
    return `$${Math.round(val).toLocaleString("en-US")}`;
  };

  const cards = [
    {
      title: "Google Ad Spend",
      value: formatCurrency(kpis.totalSpend || 0),
      subtitle: `${kpis.activeCampaignsCount} active / ${kpis.totalCampaignsCount} total campaigns`,
      icon: DollarSign,
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      accentBorder: "hover:border-blue-300",
    },
    {
      title: "Leads & Conversions",
      value: (kpis.totalConversions || 0).toLocaleString("en-IN"),
      subtitle: "Search & PMax form conversions",
      icon: Target,
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      accentBorder: "hover:border-emerald-300",
    },
    {
      title: "Avg Cost / Conversion",
      value: formatCurrency(kpis.avgCostPerConversion || 0),
      subtitle: kpis.totalConversions > 0 ? "Target CPL: ₹650" : "No conversions recorded",
      icon: TrendingUp,
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      accentBorder: "hover:border-purple-300",
    },
    {
      title: "Search Impressions",
      value: (kpis.totalImpressions || 0).toLocaleString("en-IN"),
      subtitle: `${(kpis.totalClicks || 0).toLocaleString("en-IN")} total link clicks`,
      icon: Search,
      textColor: "text-amber-600",
      bgColor: "bg-amber-50",
      accentBorder: "hover:border-amber-300",
    },
    {
      title: "Click-Through Rate",
      value: `${kpis.avgCtr || 0}%`,
      subtitle: `Avg CPC: ${formatCurrency(kpis.avgCpc || 0)}`,
      icon: MousePointerClick,
      textColor: "text-rose-600",
      bgColor: "bg-rose-50",
      accentBorder: "hover:border-rose-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:shadow-md ${card.accentBorder} transition-all relative overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider truncate">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.bgColor} ${card.textColor} shadow-xs`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              {card.value}
            </div>
            <div className="text-xs font-medium text-[var(--text-secondary)] mt-1 truncate">
              {card.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
}
