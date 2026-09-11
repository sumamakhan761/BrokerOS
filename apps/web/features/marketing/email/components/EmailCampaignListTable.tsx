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
  Download,
  UserCog,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import type { CampaignItem } from "@/features/marketing/types";
import { CAMPAIGN_STATUS_CONFIG } from "@brokeros/constants";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";

export interface EmailCampaignListTableProps {
  campaigns: CampaignItem[];
  isLoading?: boolean;
}

export function EmailCampaignListTable({ campaigns, isLoading }: EmailCampaignListTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      (c.project?.name && c.project.name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalItems = filtered.length;
  const paginatedCampaigns = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (st: string) => {
    setStatusFilter(st);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedCampaignIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedCampaignIds(next);
  };

  const handleSelectAllOnPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = new Set(selectedCampaignIds);
    if (e.target.checked) {
      paginatedCampaigns.forEach((c) => next.add(c.id));
    } else {
      paginatedCampaigns.forEach((c) => next.delete(c.id));
    }
    setSelectedCampaignIds(next);
  };

  const isAllOnPageSelected =
    paginatedCampaigns.length > 0 &&
    paginatedCampaigns.every((c) => selectedCampaignIds.has(c.id));

  const totalRecipientsInSelected = campaigns
    .filter((c) => selectedCampaignIds.has(c.id))
    .reduce((sum, c) => sum + (c.totalRecipients || 0), 0);

  // Multi-Campaign CSV Export
  const handleBulkExportCsv = async () => {
    if (selectedCampaignIds.size === 0) return;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    setIsExporting(true);

    try {
      const res = await fetch(`${baseUrl}/api/marketing/campaigns/leads/export-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ campaignIds: Array.from(selectedCampaignIds) }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || "Failed to fetch lead export data");
      }

      const rows: any[] = await res.json();

      if (rows.length === 0) {
        toast.info("No recipient lead records found in selected campaigns.");
        return;
      }

      const headers = [
        "Recipient Name",
        "Email",
        "Phone",
        "Campaign Title",
        "Project",
        "Assigned Provider",
        "Sender Email",
        "Delivery Status",
        "Opens",
        "Clicks",
        "CRM Lead Status",
        "Sent At",
      ];

      const escapeCsv = (val: any) => {
        const str = String(val ?? "");
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [
          headers.join(","),
          ...rows.map((r) =>
            [
              escapeCsv(r.name),
              escapeCsv(r.email),
              escapeCsv(r.phone),
              escapeCsv(r.campaignTitle),
              escapeCsv(r.projectName),
              escapeCsv(r.assignedProvider),
              escapeCsv(r.assignedSenderEmail),
              escapeCsv(r.status),
              r.openCount,
              r.clickCount,
              escapeCsv(r.leadId ? "CRM_LEAD" : "UNPROMOTED"),
              escapeCsv(r.sentAt ? new Date(r.sentAt).toLocaleString() : "N/A"),
            ].join(",")
          ),
        ].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `multi-campaign-leads-${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(
        `Successfully exported ${rows.length} leads across ${selectedCampaignIds.size} campaigns!`
      );
    } catch (err: any) {
      toast.error(err?.message || "CSV Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  // Bulk Assign Leads to Pre-Sales Manager
  const handleBulkAssignToPreSales = async () => {
    if (selectedCampaignIds.size === 0) return;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

    const confirmed = window.confirm(
      `Are you sure you want to push all leads from the ${selectedCampaignIds.size} selected campaigns directly into the Pre-Sales Manager's unassigned queue?`
    );
    if (!confirmed) return;

    setIsAssigning(true);
    try {
      const res = await fetch(`${baseUrl}/api/marketing/campaigns/leads/bulk-assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ campaignIds: Array.from(selectedCampaignIds) }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || "Failed to assign leads to Pre-Sales");
      }

      const result = await res.json();
      toast.success(
        `Pushed to Pre-Sales Manager: ${result.newlyCreated} created, ${result.alreadyExisted} already in CRM!`,
        {
          action: {
            label: "Open Queue",
            onClick: () => {
              window.location.href = "/dashboard/pre-sales-manager/new-leads";
            },
          },
        }
      );
      setSelectedCampaignIds(new Set());
    } catch (err: any) {
      toast.error(err?.message || "Failed to assign leads to Pre-Sales Manager");
    } finally {
      setIsAssigning(false);
    }
  };

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
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200/90 rounded-xl text-xs text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] shadow-xs transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 overflow-x-auto">
          {["ALL", "PROCESSING", "COMPLETED", "SCHEDULED", "DRAFT"].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusFilterChange(st)}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${statusFilter === st
                ? "bg-white text-[var(--text-primary)] shadow-xs"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
            >
              {st === "ALL" ? "All Campaigns" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Multi-Campaign Action Toolbar */}
      {selectedCampaignIds.size > 0 && (
        <div className="p-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-700/80 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--brand-500)] flex items-center justify-center text-white font-bold text-xs">
              {selectedCampaignIds.size}
            </div>
            <div>
              <p className="text-xs font-extrabold text-white">
                {selectedCampaignIds.size} Campaign{selectedCampaignIds.size === 1 ? "" : "s"} Selected
              </p>
              <p className="text-[11px] font-medium text-slate-300">
                ~{totalRecipientsInSelected.toLocaleString()} total target audience leads
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkExportCsv}
              disabled={isExporting}
              className="h-8 px-3 text-xs font-bold gap-1.5 bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-2xs"
            >
              <Download className={`w-3.5 h-3.5 ${isExporting ? "animate-spin" : ""}`} />
              <span>{isExporting ? "Exporting..." : "Export Leads (CSV)"}</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleBulkAssignToPreSales}
              disabled={isAssigning}
              className="h-8 px-3.5 text-xs font-bold gap-1.5 shadow-2xs bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white"
            >
              <UserCog className={`w-3.5 h-3.5 ${isAssigning ? "animate-spin" : ""}`} />
              <span>{isAssigning ? "Routing Leads..." : "Assign Leads to Pre-Sales Manager"}</span>
            </Button>

            <button
              type="button"
              onClick={() => setSelectedCampaignIds(new Set())}
              aria-label="Clear selection"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Campaigns Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--text-secondary)]">
            <thead className="bg-slate-50/90 text-[11px] font-extrabold uppercase text-[var(--text-tertiary)] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllOnPageSelected}
                    onChange={handleSelectAllOnPage}
                    aria-label="Select all campaigns on page"
                    className="rounded border-slate-300 text-[var(--brand-600)] focus:ring-[var(--brand-500)] cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Campaign & Subject</th>
                <th className="py-3.5 px-4">Audience</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Performance</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {paginatedCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400">
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
                paginatedCampaigns.map((camp) => {
                  const isSelected = selectedCampaignIds.has(camp.id);
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
                      className={`hover:bg-slate-50/70 transition-colors group ${isSelected ? "bg-purple-50/40" : ""
                        }`}
                    >
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(camp.id)}
                          aria-label={`Select ${camp.title}`}
                          className="rounded border-slate-300 text-[var(--brand-600)] focus:ring-[var(--brand-500)] cursor-pointer"
                        />
                      </td>

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

        {/* Universal Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}
