"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Search,
  Building,
  Users,
  FileSpreadsheet,
  ArrowRight,
  Eye,
  MousePointer,
  Sparkles,
} from "lucide-react";
import type { CampaignItem } from "../types";
import { CAMPAIGN_STATUS_CONFIG } from "@brokeros/constants";
import { Button } from "@/components/ui/Button";

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
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns by title, project, or subject..."
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
              {st === "ALL" ? "All Campaigns" : st}
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
                <th className="py-3.5 px-4">Campaign & Subject</th>
                <th className="py-3.5 px-4">Audience</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Performance</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-[var(--brand-600)] mx-auto mb-2.5">
                      <Mail className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">No campaigns found</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Launch your first email broadcast to view live deliverability metrics.
                    </p>
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
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-purple-50 text-[var(--brand-600)] mt-0.5 shrink-0">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/marketing/email/campaigns/${camp.id}`}
                              className="font-extrabold text-xs text-[var(--text-primary)] hover:text-[var(--brand-600)] transition-colors line-clamp-1"
                            >
                              {camp.title}
                            </Link>
                            <p className="text-[11px] font-medium text-[var(--text-tertiary)] line-clamp-1 mt-0.5">
                              {camp.subject}
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
                            <span className="font-extrabold text-[var(--text-primary)] tabular-nums">
                              {camp.deliveredCount?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-bold">
                            <span className="inline-flex items-center gap-1 text-[var(--brand-600)]">
                              <Eye className="w-3 h-3" />
                              {openRate}%
                            </span>
                            <span className="inline-flex items-center gap-1 text-emerald-600">
                              <MousePointer className="w-3 h-3" />
                              {clickRate}%
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-[11px] font-medium text-[var(--text-tertiary)] whitespace-nowrap">
                        {camp.createdAt ? new Date(camp.createdAt).toLocaleDateString() : "Just now"}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <Link href={`/dashboard/marketing/email/campaigns/${camp.id}`}>
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
