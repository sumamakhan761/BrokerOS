"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  ArrowRight,
  TrendingUp,
  Layers,
  Sparkles,
  ExternalLink,
  Video,
  Clock,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type {
  InstagramCampaignOverviewItem,
  InstagramPlacementType,
} from "../types";

interface InstagramCampaignTableProps {
  campaigns: InstagramCampaignOverviewItem[];
  loading?: boolean;
  onSync?: () => void;
  syncing?: boolean;
  hasIntegration?: boolean;
  onConnectClick?: () => void;
}

export function InstagramCampaignTable({
  campaigns,
  loading = false,
  onSync,
  syncing = false,
  hasIntegration = true,
  onConnectClick,
}: InstagramCampaignTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [placementFilter, setPlacementFilter] = useState<string>("ALL");

  const filteredCampaigns = campaigns.filter((camp) => {
    const matchesSearch = camp.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || camp.status === statusFilter;
    const matchesPlacement =
      placementFilter === "ALL" ||
      (camp.placements &&
        camp.placements.includes(placementFilter as InstagramPlacementType));

    return matchesSearch && matchesStatus && matchesPlacement;
  });

  const formatCurrency = (val: number, cur: string = "INR") => {
    if (cur === "INR") {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${Math.round(val).toLocaleString("en-IN")}`;
    }
    return `$${Math.round(val).toLocaleString("en-US")}`;
  };

  const renderPlacementBadges = (placements: InstagramPlacementType[]) => {
    return (
      <div className="flex flex-wrap items-center gap-1">
        {placements?.includes("REELS") && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
            <Video className="w-2.5 h-2.5" />
            <span>Reels</span>
          </span>
        )}
        {placements?.includes("STORY") && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Clock className="w-2.5 h-2.5" />
            <span>Stories</span>
          </span>
        )}
        {placements?.includes("FEED") && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <LayoutGrid className="w-2.5 h-2.5" />
            <span>Feed</span>
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Instagram campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200/80 bg-white placeholder:text-slate-400 focus:outline-hidden focus:border-pink-500 shadow-2xs"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
            {["ALL", "ACTIVE", "PAUSED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-white text-[var(--text-primary)] shadow-2xs"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {st === "ALL" ? "All Status" : st}
              </button>
            ))}
          </div>

          {/* Placement Tabs */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
            {["ALL", "REELS", "STORY", "FEED"].map((pl) => (
              <button
                key={pl}
                onClick={() => setPlacementFilter(pl)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  placementFilter === pl
                    ? "bg-white text-pink-600 shadow-2xs"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {pl === "ALL" ? "All Placements" : pl}
              </button>
            ))}
          </div>
        </div>

        {/* Sync Action */}
        <div className="flex items-center gap-2">
          {onSync && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSync}
              disabled={syncing || loading || !hasIntegration}
              className="gap-1.5 text-xs font-bold text-pink-700 hover:text-pink-800 hover:bg-pink-50 border-pink-200"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`}
              />
              <span>{syncing ? "Syncing..." : "Sync Live IG Data"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-tertiary)]">
                <th className="py-3 px-4">Instagram Campaign</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Placements</th>
                <th className="py-3 px-4">Spend</th>
                <th className="py-3 px-4">IG Leads</th>
                <th className="py-3 px-4">Cost / Lead</th>
                <th className="py-3 px-4">CTR & Imp.</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-pink-500" />
                    <span>Loading Instagram campaigns...</span>
                  </td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mx-auto shadow-xs">
                        <Video className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-extrabold text-[var(--text-primary)]">
                        No Instagram Campaigns Found
                      </h4>
                      <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                        {!hasIntegration
                          ? "Connect your Meta Ad Account with Instagram placements to start syncing campaigns and capturing leads."
                          : "No campaigns matching your current filter criteria."}
                      </p>
                      {!hasIntegration && onConnectClick && (
                        <Button
                          size="sm"
                          onClick={onConnectClick}
                          className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:opacity-90 text-white font-bold text-xs gap-1.5 shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Connect Instagram Ads</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((camp) => {
                  const currency = camp.integration?.currency || "INR";
                  return (
                    <tr
                      key={camp.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      {/* Campaign Name & Objective */}
                      <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">
                        <div className="flex flex-col">
                          <Link
                            href={`/dashboard/marketing/ads/instagram/campaigns/${camp.id}`}
                            className="hover:text-pink-600 transition-colors flex items-center gap-1.5"
                          >
                            <span className="truncate max-w-[220px]">
                              {camp.name}
                            </span>
                          </Link>
                          <span className="text-[10px] font-mono text-[var(--text-tertiary)] mt-0.5">
                            ID: {camp.id} · {camp.objective}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            camp.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                              : "bg-amber-50 text-amber-700 border border-amber-200/80"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              camp.status === "ACTIVE"
                                ? "bg-emerald-500 animate-pulse"
                                : "bg-amber-500"
                            }`}
                          />
                          {camp.status}
                        </span>
                      </td>

                      {/* Placements */}
                      <td className="py-3.5 px-4">
                        {renderPlacementBadges(camp.placements)}
                      </td>

                      {/* Spend */}
                      <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">
                        {formatCurrency(camp.spend, currency)}
                      </td>

                      {/* Leads Count */}
                      <td className="py-3.5 px-4 font-black text-emerald-600">
                        {camp.leadsCount.toLocaleString()}
                      </td>

                      {/* Cost Per Lead */}
                      <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">
                        {camp.leadsCount > 0
                          ? formatCurrency(camp.costPerLead, currency)
                          : "—"}
                      </td>

                      {/* Impressions & CTR */}
                      <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                        <div className="flex flex-col">
                          <span>
                            {camp.ctr ? `${camp.ctr.toFixed(1)}% CTR` : "0%"}
                          </span>
                          <span className="text-[10px] text-[var(--text-tertiary)]">
                            {camp.impressions.toLocaleString()} imp.
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/dashboard/marketing/ads/instagram/campaigns/${camp.id}`}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-xs font-bold hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3.5 h-3.5" />
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
    </div>
  );
}
