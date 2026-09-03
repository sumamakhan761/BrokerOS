"use client";

import React from "react";
import { DollarSign, Users, Target, Eye, MousePointerClick } from "lucide-react";
import type { MetaCampaignSummaryKpis } from "../types";

interface MetaKpiCardsProps {
  kpis: MetaCampaignSummaryKpis;
  currency?: string;
}

export function MetaKpiCards({ kpis, currency = "INR" }: MetaKpiCardsProps) {
  const formatCurrency = (val: number) => {
    if (currency === "INR") {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${val.toLocaleString("en-IN")}`;
    }
    return `$${val.toLocaleString("en-US")}`;
  };

  const cards = [
    {
      title: "Total Ad Spend",
      value: formatCurrency(kpis.totalSpend || 0),
      subtitle: `${kpis.activeCampaignsCount} active / ${kpis.totalCampaignsCount} total campaigns`,
      icon: DollarSign,
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      accentBorder: "hover:border-blue-300",
    },
    {
      title: "Leads Acquired",
      value: (kpis.totalLeads || 0).toLocaleString(),
      subtitle: "Instant Forms & Messenger",
      icon: Users,
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      accentBorder: "hover:border-emerald-300",
    },
    {
      title: "Avg Cost Per Lead",
      value: formatCurrency(kpis.avgCpl || 0),
      subtitle: kpis.totalLeads > 0 ? "Direct Meta form conversion" : "No leads recorded yet",
      icon: Target,
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      accentBorder: "hover:border-purple-300",
    },
    {
      title: "Impressions & Reach",
      value: (kpis.totalImpressions || 0).toLocaleString(),
      subtitle: `${(kpis.totalReach || 0).toLocaleString()} unique buyers reached`,
      icon: Eye,
      textColor: "text-amber-600",
      bgColor: "bg-amber-50",
      accentBorder: "hover:border-amber-300",
    },
    {
      title: "Click-Through Rate",
      value: `${kpis.avgCtr || 0}%`,
      subtitle: `${(kpis.totalClicks || 0).toLocaleString()} total link clicks`,
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
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.bgColor} ${card.textColor} shadow-xs`}>
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
