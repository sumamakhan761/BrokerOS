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
  hasIntegration?: boolean;
  onConnectClick?: () => void;
}

export function MetaCampaignTable({
  campaigns,
  loading = false,
  onSync,
  syncing = false,
  hasIntegration = false,
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
      case "ARCHIVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/80">
            <Archive className="w-3.5 h-3.5" />
            Archived
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

  const getObjectiveLabel = (objective: string) => {
    switch (objective) {
      case "OUTCOME_LEADS":
        return { label: "Lead Generation", color: "bg-blue-50 text-blue-700 border-blue-200/80" };
      case "OUTCOME_TRAFFIC":
        return { label: "Website Traffic", color: "bg-emerald-50 text-emerald-700 border-emerald-200/80" };
      case "OUTCOME_SALES":
        return { label: "Conversions / Sales", color: "bg-purple-50 text-purple-700 border-purple-200/80" };
      case "OUTCOME_AWARENESS":
        return { label: "Brand Awareness", color: "bg-amber-50 text-amber-700 border-amber-200/80" };
      default:
        return { label: objective.replace("OUTCOME_", ""), color: "bg-slate-50 text-slate-700 border-slate-200/80" };
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
              placeholder="Search campaigns by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-500)]/20 focus:border-[var(--brand-500)] transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by Status"
            className="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-500)]/20"
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
            className="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-500)]/20"
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
              className="text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-blue-600" : ""}`} />
              <span>{syncing ? "Syncing Meta..." : "Sync Live Data"}</span>
            </Button>
          )}

          {onConnectClick && (
            <Button
              variant="default"
              size="sm"
              onClick={onConnectClick}
              className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Connect Ad Account</span>
            </Button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[var(--text-tertiary)] font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Campaign Name & ID</th>
              <th className="py-3.5 px-4">Objective</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Spend</th>
              <th className="py-3.5 px-4 text-right">Leads Acquired</th>
              <th className="py-3.5 px-4 text-right">Cost Per Lead (CPL)</th>
              <th className="py-3.5 px-4 text-right">Impressions & CTR</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[var(--text-primary)]">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[var(--text-tertiary)]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                    <p className="text-xs font-bold text-[var(--text-secondary)]">Loading Ads Marketing campaigns...</p>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-14 text-[var(--text-tertiary)]">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-xs mb-1">
                      <Layers className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-extrabold text-[var(--text-primary)]">
                      {searchTerm
                        ? "No Campaigns Match Search"
                        : hasIntegration
                        ? "No Campaigns Found in Ad Account"
                        : "No Ad Account Connected"}
                    </p>
                    <p className="text-xs font-medium text-[var(--text-tertiary)] max-w-sm">
                      {searchTerm
                        ? "Try clearing your search filters."
                        : hasIntegration
                        ? "Your Meta Ad Account is connected, but 0 campaigns were returned by Meta. Create a campaign (or paused draft) in Meta Ads Manager and click Sync Live Data."
                        : "Connect your Meta Ad Account to view running campaigns, spend, and leads."}
                    </p>
                    {hasIntegration && onSync && !searchTerm && (
                      <Button
                        size="sm"
                        onClick={onSync}
                        disabled={syncing}
                        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                        <span>{syncing ? "Syncing Meta..." : "Sync Live Data"}</span>
                      </Button>
                    )}
                    {!hasIntegration && onConnectClick && !searchTerm && (
                      <Button
                        size="sm"
                        onClick={onConnectClick}
                        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                      >
                        Connect Ad Account
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
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-medium">
                      <div className="flex flex-col">
                        <Link
                          href={`/dashboard/marketing/ads/meta/campaigns/${camp.id}`}
                          className="text-[var(--text-primary)] hover:text-blue-600 font-extrabold flex items-center gap-1.5 transition-colors text-xs"
                        >
                          {camp.name}
                        </Link>
                        <span className="text-[11px] text-[var(--text-tertiary)] font-mono mt-0.5">
                          ID: {camp.id} {camp.integration?.name ? `• ${camp.integration.name}` : ""}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${objMeta.color}`}>
                        {objMeta.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(camp.status)}</td>

                    <td className="py-3.5 px-4 text-right font-extrabold text-[var(--text-primary)]">
                      {formatCurrency(camp.spend || 0, currency)}
                      {camp.dailyBudget ? (
                        <div className="text-[10px] text-[var(--text-tertiary)] font-normal">
                          Daily: {formatCurrency(camp.dailyBudget, currency)}
                        </div>
                      ) : null}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-extrabold text-emerald-600">
                        {(camp.leadsCount || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[var(--text-tertiary)] block">Form Leads</span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold">
                      {camp.leadsCount > 0 ? (
                        <span className="text-[var(--text-primary)]">
                          {formatCurrency(camp.costPerLead || 0, currency)}
                        </span>
                      ) : (
                        <span className="text-[var(--text-tertiary)]">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="text-[var(--text-primary)] font-extrabold">
                        {(camp.impressions || 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[var(--text-tertiary)] font-medium">
                        CTR: {camp.ctr ? `${camp.ctr.toFixed(2)}%` : "0.00%"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/dashboard/marketing/ads/meta/campaigns/${camp.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <span>View Details</span>
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
