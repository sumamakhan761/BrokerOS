"use client";

import React from "react";
import { Video, Clock, LayoutGrid, Compass, TrendingUp, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { InstagramPlacementBreakdown } from "../types";

interface InstagramPlacementBreakdownProps {
  breakdown?: InstagramPlacementBreakdown;
  currency?: string;
}

export function InstagramPlacementBreakdownWidget({
  breakdown,
  currency = "INR",
}: InstagramPlacementBreakdownProps) {
  const formatCurrency = (val: number) => {
    if (currency === "INR") {
      if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
      return `₹${Math.round(val).toLocaleString("en-IN")}`;
    }
    return `$${Math.round(val).toLocaleString("en-US")}`;
  };

  const placements = [
    {
      key: "reels",
      title: "Instagram Reels",
      badge: "9:16 Video",
      icon: Video,
      gradient: "from-pink-500 to-rose-600",
      iconBg: "bg-pink-50 text-pink-600",
      data: breakdown?.reels,
    },
    {
      key: "stories",
      title: "Instagram Stories",
      badge: "9:16 Ephemeral",
      icon: Clock,
      gradient: "from-purple-500 to-pink-500",
      iconBg: "bg-purple-50 text-purple-600",
      data: breakdown?.stories,
    },
    {
      key: "feed",
      title: "Instagram Feed",
      badge: "1:1 / 4:5 Posts",
      icon: LayoutGrid,
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-50 text-blue-600",
      data: breakdown?.feed,
    },
    {
      key: "explore",
      title: "Instagram Explore",
      badge: "Discovery Grid",
      icon: Compass,
      gradient: "from-amber-500 to-orange-500",
      iconBg: "bg-amber-50 text-amber-600",
      data: breakdown?.explore,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
            Placement Performance Breakdown
          </h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Compare acquisition cost & lead conversion across Instagram surfaces.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {placements.map((p) => {
          const item = p.data;
          const Icon = p.icon;
          const leads = item?.leadsCount || 0;
          const spend = item?.spend || 0;
          const cpl = leads > 0 ? Math.round(spend / leads) : item?.costPerLead || 0;

          return (
            <div
              key={p.key}
              className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-sm transition-all"
            >
              <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${p.gradient}`} />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-xl ${p.iconBg} flex items-center justify-center font-extrabold shadow-xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-[var(--text-secondary)]">
                    {p.badge}
                  </span>
                </div>

                <h4 className="text-xs font-black text-[var(--text-primary)] tracking-tight">
                  {p.title}
                </h4>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                      Spend
                    </span>
                    <span className="text-xs font-black text-[var(--text-primary)] block mt-0.5">
                      {formatCurrency(spend)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                      Leads
                    </span>
                    <span className="text-xs font-black text-emerald-600 block mt-0.5">
                      {leads.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                      CPL
                    </span>
                    <span className="text-xs font-black text-[var(--text-primary)] block mt-0.5">
                      {leads > 0 ? formatCurrency(cpl) : "—"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">
                      CTR
                    </span>
                    <span className="text-xs font-black text-[var(--text-primary)] block mt-0.5">
                      {item?.ctr ? `${item.ctr.toFixed(1)}%` : "0%"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
