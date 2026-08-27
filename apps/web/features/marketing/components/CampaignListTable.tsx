"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Search,
  Filter,
  BarChart2,
  Calendar,
  Send,
  Eye,
  MousePointer,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  Users,
  FileSpreadsheet,
} from "lucide-react";
import type { CampaignItem, CampaignStatus } from "../types";
import { CAMPAIGN_STATUS_CONFIG } from "@brokeros/constants";

interface CampaignListTableProps {
  campaigns: CampaignItem[];
  isLoading?: boolean;
}

export function CampaignListTable({ campaigns, isLoading }: CampaignListTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Header controls: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns by title or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-lg border border-slate-200/80 dark:border-zinc-700/80 overflow-x-auto">
          {["ALL", "PROCESSING", "COMPLETED", "SCHEDULED", "DRAFT"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                statusFilter === st
                  ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {st === "ALL" ? "All Campaigns" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-zinc-300">
            <thead className="bg-slate-50 dark:bg-zinc-800/60 text-xs font-semibold uppercase text-slate-500 dark:text-zinc-400 tracking-wider border-b border-slate-200/80 dark:border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Campaign & Subject</th>
                <th className="py-3.5 px-4">Audience</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Performance</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-normal">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-zinc-500">
                    <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-zinc-600" />
                    <p className="text-sm font-medium">No email campaigns found</p>
                    <p className="text-xs text-slate-400">Launch your first real estate campaign to view live analytics.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((camp) => {
                  const statusMeta =
                    CAMPAIGN_STATUS_CONFIG[camp.status] || CAMPAIGN_STATUS_CONFIG.DRAFT;
                  const openRate =
                    camp.deliveredCount > 0
                      ? ((camp.openedCount / camp.deliveredCount) * 100).toFixed(1)
                      : "0.0";
                  const clickRate =
                    camp.deliveredCount > 0
                      ? ((camp.clickedCount / camp.deliveredCount) * 100).toFixed(1)
                      : "0.0";

                  return (
                    <tr
                      key={camp.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 mt-0.5">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/marketing/email/campaigns/${camp.id}`}
                              className="font-semibold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors line-clamp-1"
                            >
                              {camp.title}
                            </Link>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                              {camp.subject}
                            </p>
                            {camp.project && (
                              <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-zinc-400 mt-1 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                                <Building className="w-3 h-3 text-slate-400" />
                                <span>{camp.project.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                          {camp.audienceSource === "CSV_UPLOAD" ? (
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Users className="w-3.5 h-3.5 text-sky-500" />
                          )}
                          <span>{camp.totalRecipients.toLocaleString()} Leads</span>
                        </div>
                        <span className="text-[11px] text-slate-400 capitalize">
                          {camp.audienceSource === "CSV_UPLOAD" ? "CSV Import" : "CRM Database"}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusMeta.bg}`}
                        >
                          {camp.status === "PROCESSING" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                          )}
                          {statusMeta.label}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <Eye className="w-3.5 h-3.5 text-sky-500" />
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">
                              {openRate}%
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              ({camp.openedCount.toLocaleString()})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <MousePointer className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">
                              {clickRate}%
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              ({camp.clickedCount.toLocaleString()})
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-zinc-400">
                        {new Date(camp.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <Link
                          href={`/dashboard/marketing/email/campaigns/${camp.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-700 dark:text-zinc-300 hover:text-sky-600 dark:hover:text-sky-400 text-xs font-semibold rounded-lg transition-colors border border-slate-200 dark:border-zinc-700"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                          <span>Analytics</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
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
