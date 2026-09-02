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
      color: "from-blue-600 to-indigo-600",
      textColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      borderColor: "border-blue-100 dark:border-blue-900/50",
    },
    {
      title: "Leads Acquired",
      value: (kpis.totalLeads || 0).toLocaleString(),
      subtitle: "Instant Forms & Messenger",
      icon: Users,
      color: "from-emerald-600 to-teal-600",
      textColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      borderColor: "border-emerald-100 dark:border-emerald-900/50",
    },
    {
      title: "Avg Cost Per Lead (CPL)",
      value: formatCurrency(kpis.avgCpl || 0),
      subtitle: kpis.totalLeads > 0 ? "Direct Meta form conversion" : "No leads recorded yet",
      icon: Target,
      color: "from-purple-600 to-violet-600",
      textColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
      borderColor: "border-purple-100 dark:border-purple-900/50",
    },
    {
      title: "Impressions & Reach",
      value: (kpis.totalImpressions || 0).toLocaleString(),
      subtitle: `${(kpis.totalReach || 0).toLocaleString()} unique buyers reached`,
      icon: Eye,
      color: "from-amber-600 to-orange-600",
      textColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      borderColor: "border-amber-100 dark:border-amber-900/50",
    },
    {
      title: "Click-Through Rate (CTR)",
      value: `${kpis.avgCtr || 0}%`,
      subtitle: `${(kpis.totalClicks || 0).toLocaleString()} total link clicks`,
      icon: MousePointerClick,
      color: "from-pink-600 to-rose-600",
      textColor: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-50 dark:bg-pink-950/40",
      borderColor: "border-pink-100 dark:border-pink-900/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-xl border bg-white dark:bg-zinc-900 ${card.borderColor} shadow-xs hover:shadow-md transition-shadow relative overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">
                {card.title}
              </span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bgColor} ${card.textColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {card.value}
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 truncate">
              {card.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
}
