"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  PlayCircle,
  PauseCircle,
  Archive,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { MetaCampaignCacheItem } from "../types";

interface MetaCampaignTableProps {
  campaigns: MetaCampaignCacheItem[];
  loading?: boolean;
  onSync?: () => void;
  syncing?: boolean;
  onConnectClick?: () => void;
}

export function MetaCampaignTable({
  campaigns,
  loading = false,
  onSync,
  syncing = false,
  onConnectClick,
}: MetaCampaignTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [objectiveFilter, setObjectiveFilter] = useState<string>("ALL");

  const filtered = campaigns.filter((camp) => {
    const matchesSearch =
      camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || camp.status === statusFilter;
    const matchesObjective = objectiveFilter === "ALL" || camp.objective === objectiveFilter;
    return matchesSearch && matchesStatus && matchesObjective;
  });

  const formatCurrency = (val: number, cur: string = "INR") => {
    if (cur === "INR") {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      return `₹${Math.round(val).toLocaleString("en-IN")}`;
    }
    return `$${Math.round(val).toLocaleString("en-US")}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case "PAUSED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            <PauseCircle className="w-3 h-3" />
            Paused
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            <Archive className="w-3 h-3" />
            Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {status}
          </span>
        );
    }
  };

  const getObjectiveLabel = (objective: string) => {
    switch (objective) {
      case "OUTCOME_LEADS":
        return { label: "Lead Generation", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400" };
      case "OUTCOME_TRAFFIC":
        return { label: "Traffic / Visits", color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400" };
      case "OUTCOME_SALES":
        return { label: "Conversions / Sales", color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400" };
      case "OUTCOME_AWARENESS":
        return { label: "Brand Awareness", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400" };
      default:
        return { label: objective.replace("OUTCOME_", ""), color: "bg-zinc-50 text-zinc-700 border-zinc-200" };
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search campaigns by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by Status"
            className="text-xs py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <select
            value={objectiveFilter}
            onChange={(e) => setObjectiveFilter(e.target.value)}
            aria-label="Filter by Objective"
            className="text-xs py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 focus:outline-hidden"
          >
            <option value="ALL">All Objectives</option>
            <option value="OUTCOME_LEADS">Lead Generation</option>
            <option value="OUTCOME_TRAFFIC">Website Traffic</option>
            <option value="OUTCOME_SALES">Sales / Conversions</option>
            <option value="OUTCOME_AWARENESS">Awareness</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {onSync && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSync}
              disabled={syncing || loading}
              className="text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing Meta..." : "Sync Live Data"}
            </Button>
          )}

          {onConnectClick && (
            <Button
              variant="default"
              size="sm"
              onClick={onConnectClick}
              className="text-xs bg-[#0081FB] hover:bg-[#0070df] text-white flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Connect Ad Account
            </Button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50/80 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
            <tr>
              <th className="py-3 px-4">Campaign Name & ID</th>
              <th className="py-3 px-4">Objective</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Spend</th>
              <th className="py-3 px-4 text-right">Leads Acquired</th>
              <th className="py-3 px-4 text-right">Cost Per Lead (CPL)</th>
              <th className="py-3 px-4 text-right">Impressions & CTR</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-zinc-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                    <p className="text-xs font-medium">Loading Meta Ads campaigns...</p>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-zinc-400">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                      <Layers className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No Meta Campaigns Found</p>
                    <p className="text-xs text-zinc-500">
                      {searchTerm
                        ? "No campaigns match your search query."
                        : "Connect your Meta Ad Account to view running campaigns, spend, and leads."}
                    </p>
                    {onConnectClick && !searchTerm && (
                      <Button
                        size="sm"
                        onClick={onConnectClick}
                        className="mt-2 bg-[#0081FB] text-white text-xs"
                      >
                        Connect Meta Ad Account
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((camp) => {
                const objMeta = getObjectiveLabel(camp.objective);
                const currency = camp.integration?.currency || "INR";

                return (
                  <tr
                    key={camp.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-medium">
                      <div className="flex flex-col">
                        <Link
                          href={`/dashboard/marketing/ads/meta/campaigns/${camp.id}`}
                          className="text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          {camp.name}
                        </Link>
                        <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          ID: {camp.id} {camp.integration?.name ? `• ${camp.integration.name}` : ""}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${objMeta.color}`}>
                        {objMeta.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(camp.status)}</td>

                    <td className="py-3.5 px-4 text-right font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(camp.spend || 0, currency)}
                      {camp.dailyBudget ? (
                        <div className="text-[10px] text-zinc-400 font-normal">
                          Daily: {formatCurrency(camp.dailyBudget, currency)}
                        </div>
                      ) : null}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {(camp.leadsCount || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-zinc-400 block">Form Leads</span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium">
                      {camp.leadsCount > 0 ? (
                        <span className="text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(camp.costPerLead || 0, currency)}
                        </span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="text-zinc-900 dark:text-zinc-100 font-medium">
                        {(camp.impressions || 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        CTR: {camp.ctr ? `${camp.ctr.toFixed(2)}%` : "0.00%"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/dashboard/marketing/ads/meta/campaigns/${camp.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline px-2.5 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                      >
                        View Details
                        <ExternalLink className="w-3 h-3" />
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
