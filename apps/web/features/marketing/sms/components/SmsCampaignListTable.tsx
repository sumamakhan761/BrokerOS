"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Building,
  Users,
  FileSpreadsheet,
  ArrowRight,
  MousePointerClick,
  Layers,
  Sparkles,
} from "lucide-react";
import type { SmsCampaignItem } from "@/features/marketing/types";
import { CAMPAIGN_STATUS_CONFIG, SMS_PROVIDERS } from "@brokeros/constants";
import { Button } from "@/components/ui/Button";

export interface SmsCampaignListTableProps {
  campaigns: SmsCampaignItem[];
  isLoading?: boolean;
}

export function SmsCampaignListTable({ campaigns, isLoading }: SmsCampaignListTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.messageContent.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Header controls: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search SMS campaigns by title, copy, or project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200/90 rounded-xl text-xs text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] shadow-xs transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 overflow-x-auto">
          {["ALL", "PROCESSING", "COMPLETED", "SCHEDULED", "DRAFT"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                statusFilter === st
                  ? "bg-white text-[var(--text-primary)] shadow-xs"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {st === "ALL" ? "All Broadcasts" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-secondary)]">
            <thead className="bg-slate-50/90 text-[11px] font-extrabold uppercase text-[var(--text-tertiary)] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">Campaign & Copy</th>
                <th className="py-3.5 px-4">Audience</th>
                <th className="py-3.5 px-4">Gateway & Sender</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Performance</th>
                <th className="py-3.5 px-4 text-center">Segments</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold">
                      <Sparkles className="w-4 h-4 animate-spin text-[var(--brand-600)]" />
                      <span>Loading SMS campaigns...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mx-auto mb-2.5">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">No SMS campaigns found</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Launch your first SMS broadcast to view live carrier delivery metrics.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((camp) => {
                  const statusMeta =
                    CAMPAIGN_STATUS_CONFIG[camp.status] || CAMPAIGN_STATUS_CONFIG.DRAFT;
                  const provMeta =
                    SMS_PROVIDERS[camp.providerType] || SMS_PROVIDERS.TWILIO;
                  const deliveryRate =
                    camp.sentCount > 0
                      ? ((camp.deliveredCount / camp.sentCount) * 100).toFixed(1)
                      : "0.0";
                  const clickRate =
                    camp.deliveredCount > 0
                      ? ((camp.clickedCount / camp.deliveredCount) * 100).toFixed(1)
                      : "0.0";

                  return (
                    <tr
                      key={camp.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-4 px-4 max-w-[280px]">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 mt-0.5 shrink-0">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/dashboard/marketing/sms/campaigns/${camp.id}`}
                              className="font-extrabold text-xs text-[var(--text-primary)] hover:text-amber-600 transition-colors line-clamp-1"
                            >
                              {camp.title}
                            </Link>
                            <p className="text-[11px] font-medium text-[var(--text-tertiary)] line-clamp-1 mt-0.5">
                              {camp.messageContent}
                            </p>
                            {camp.project && (
                              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--text-secondary)] mt-1.5 bg-slate-100 px-2 py-0.5 rounded-md">
                                <Building className="w-3 h-3 text-slate-400" />
                                <span>{camp.project.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {camp.audienceSource === "CSV_UPLOAD" ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold text-[10px]">
                              <FileSpreadsheet className="w-3 h-3" />
                              <span>CSV List</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-[var(--brand-700)] border border-purple-200/80 font-bold text-[10px]">
                              <Users className="w-3 h-3" />
                              <span>CRM Leads</span>
                            </div>
                          )}
                        </div>
                        <div className="text-[11px] font-extrabold text-[var(--text-primary)] mt-1 tabular-nums">
                          {camp.totalRecipients?.toLocaleString()} recipients
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-full shadow-xs"
                            style={{ backgroundColor: provMeta.color }}
                          />
                          <span className="font-extrabold text-xs text-[var(--text-primary)]">
                            {camp.fromSender}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] mt-0.5 block">
                          {provMeta.name}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${statusMeta.bg}`}
                        >
                          {statusMeta.label}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="font-medium text-[var(--text-tertiary)]">Delivered:</span>
                            <span className="font-extrabold text-emerald-600 tabular-nums">
                              {camp.deliveredCount?.toLocaleString()} ({deliveryRate}%)
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-bold">
                            <span className="inline-flex items-center gap-1 text-[var(--brand-600)]">
                              <MousePointerClick className="w-3 h-3" />
                              {clickRate}% CTR
                            </span>
                            {camp.failedCount > 0 && (
                              <span className="text-rose-500 font-bold">
                                {camp.failedCount} failed
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80 font-mono font-bold text-[11px] text-[var(--text-primary)]">
                          <Layers className="w-3 h-3 text-slate-400" />
                          <span>{(camp.totalSegmentsSent || 0).toLocaleString()}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-[11px] font-medium text-[var(--text-tertiary)] whitespace-nowrap">
                        {camp.createdAt ? new Date(camp.createdAt).toLocaleDateString() : "Just now"}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <Link href={`/dashboard/marketing/sms/campaigns/${camp.id}`}>
                          <Button variant="outline" size="sm" className="h-7 px-2.5 text-[11px] font-bold gap-1">
                            <span>Analytics</span>
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
    </div>
  );
}
