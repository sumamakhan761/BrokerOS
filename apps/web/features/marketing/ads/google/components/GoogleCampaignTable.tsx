"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  Filter,
  PauseCircle,
  Target,
  Sparkles,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { GoogleCampaignItem } from "../types";
import { GOOGLE_CHANNEL_CONFIG } from "@brokeros/constants";
import { GoogleIcon } from "./GoogleIcon";

interface GoogleCampaignTableProps {
  campaigns: GoogleCampaignItem[];
  currency?: string;
  loading?: boolean;
  onRefresh?: () => void;
}

export function GoogleCampaignTable({
  campaigns,
  currency = "INR",
  loading = false,
}: GoogleCampaignTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChannel =
      channelFilter === "ALL" || c.advertisingChannelType === channelFilter;
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesChannel && matchesStatus;
  });

  const formatCurrency = (val: number) => {
    if (currency === "INR" || currency === "₹") {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${Math.round(val).toLocaleString("en-IN")}`;
    }
    return `$${Math.round(val).toLocaleString("en-US")}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ENABLED":
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case "PAUSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
            <PauseCircle className="w-3.5 h-3.5" />
            Paused
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search Google campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-500)]/20 focus:border-[var(--brand-500)] transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Channel Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-secondary)] focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-500)]/20 transition-all cursor-pointer"
            >
              <option value="ALL">All Channels</option>
              <option value="SEARCH">Google Search</option>
              <option value="PERFORMANCE_MAX">Performance Max</option>
              <option value="DISPLAY">Display Network</option>
              <option value="VIDEO">YouTube Video</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-secondary)] focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-500)]/20 transition-all cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ENABLED">Active</option>
            <option value="PAUSED">Paused</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-tertiary)]">
              <th className="py-3 px-4">Campaign Name & Channel</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Spend</th>
              <th className="py-3 px-4">Conversions</th>
              <th className="py-3 px-4">Cost / Conv</th>
              <th className="py-3 px-4">Clicks / CTR</th>
              <th className="py-3 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Layers className="w-8 h-8 text-slate-300 mb-2" />
                    <span className="font-medium text-sm text-[var(--text-secondary)]">
                      No Google campaigns match your filter.
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)] mt-1">
                      Try clearing search terms or status filters.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((camp) => {
                const channel =
                  GOOGLE_CHANNEL_CONFIG[
                    camp.advertisingChannelType as keyof typeof GOOGLE_CHANNEL_CONFIG
                  ] || GOOGLE_CHANNEL_CONFIG.SEARCH;

                return (
                  <tr
                    key={camp.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Campaign & Channel */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                          <GoogleIcon size={14} />
                        </div>
                        <div>
                          <Link
                            href={`/dashboard/marketing/ads/google/campaigns/${camp.id}`}
                            className="font-bold text-[var(--text-primary)] hover:underline line-clamp-1 block"
                          >
                            {camp.name}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold border ${channel.bgClass}`}
                            >
                              {channel.label}
                            </span>
                            {camp.dailyBudget && (
                              <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                                • {formatCurrency(camp.dailyBudget)}/day
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(camp.status)}
                    </td>

                    {/* Spend */}
                    <td className="py-3.5 px-4 font-bold text-[var(--text-primary)] whitespace-nowrap">
                      {formatCurrency(camp.spend || 0)}
                    </td>

                    {/* Conversions / Leads */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-black text-emerald-600">
                        <Target className="w-3.5 h-3.5" />
                        <span>{(camp.conversions || 0).toLocaleString("en-IN")}</span>
                      </div>
                    </td>

                    {/* Cost Per Conversion */}
                    <td className="py-3.5 px-4 text-[var(--text-primary)] font-semibold whitespace-nowrap">
                      {formatCurrency(camp.costPerConversion || 0)}
                    </td>

                    {/* Clicks & CTR */}
                    <td className="py-3.5 px-4 text-[var(--text-secondary)] whitespace-nowrap">
                      <div>
                        {(camp.clicks || 0).toLocaleString("en-IN")} clicks
                        <span className="text-[var(--text-tertiary)] text-[10px] ml-1 font-bold">
                          ({camp.ctr}%)
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link href={`/dashboard/marketing/ads/google/campaigns/${camp.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs font-bold"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
