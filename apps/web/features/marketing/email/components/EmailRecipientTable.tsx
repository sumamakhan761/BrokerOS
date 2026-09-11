// ============================================================================
// BrokerOS — Email Campaign Recipient Activity & Drill-Down Table
// ============================================================================

"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  Eye,
  MousePointer,
  AlertTriangle,
  UserCheck,
  UserPlus,
  FileSpreadsheet,
  Download,
  UserCog,
  MessageSquare,
  Filter,
  Layers,
  X,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";

export interface EmailRecipientRow {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  status: string;
  source: string;
  openCount: number;
  clickCount: number;
  hasReplied?: boolean;
  sentAt?: string;
  firstOpenedAt?: string;
  firstClickedAt?: string;
  leadId?: string;
  lead?: {
    id: string;
    firstName: string;
    lastName?: string;
    temperature?: string;
    status?: string;
  };
}

export interface RecipientCounts {
  all: number;
  opened: number;
  clicked: number;
  replied: number;
  unopened: number;
  bounced: number;
  inCrm: number;
  unpromoted: number;
}

export interface EmailRecipientTableProps {
  recipients: EmailRecipientRow[];
  counts?: RecipientCounts | null;
  onPromoteRecipient: (recipientId: string) => Promise<void>;
  campaignId?: string;
  campaignTitle?: string;
  isLoading?: boolean;
}

export type EngagementFilterType = "ALL" | "REPLIED" | "OPENED" | "CLICKED" | "UNOPENED" | "BOUNCED";
export type CrmFilterType = "ALL" | "UNPROMOTED" | "IN_CRM";
export type SourceFilterType = "ALL" | "CSV_UPLOAD" | "CRM_DATABASE";

export function EmailRecipientTable({
  recipients,
  counts,
  onPromoteRecipient,
  campaignId,
  campaignTitle,
  isLoading,
}: EmailRecipientTableProps) {
  const [search, setSearch] = useState("");
  const [engagementFilter, setEngagementFilter] = useState<EngagementFilterType>("ALL");
  const [crmStatusFilter, setCrmStatusFilter] = useState<CrmFilterType>("ALL");
  const [sourceFilter, setSourceFilter] = useState<SourceFilterType>("ALL");

  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Fallback dynamic counts computed from array if server counts not provided
  const liveCounts: RecipientCounts = useMemo(() => {
    if (counts) return counts;
    let opened = 0;
    let clicked = 0;
    let replied = 0;
    let bounced = 0;
    let inCrm = 0;

    recipients.forEach((r) => {
      if (r.hasReplied) replied++;
      if (r.openCount > 0 || r.status === "OPENED" || r.status === "CLICKED") opened++;
      if (r.clickCount > 0 || r.status === "CLICKED") clicked++;
      if (r.status === "BOUNCED" || r.status === "FAILED") bounced++;
      if (r.leadId) inCrm++;
    });

    const all = recipients.length;
    const unopened = Math.max(0, all - opened - bounced);
    const unpromoted = Math.max(0, all - inCrm);

    return { all, opened, clicked, replied, unopened, bounced, inCrm, unpromoted };
  }, [counts, recipients]);

  // Master Filter Engine
  const filtered = useMemo(() => {
    return recipients.filter((r) => {
      // 1. Text Search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = r.name?.toLowerCase().includes(q);
        const matchesEmail = r.email.toLowerCase().includes(q);
        const matchesPhone = r.phone?.includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone) return false;
      }

      // 2. Engagement Filter
      if (engagementFilter === "REPLIED") {
        if (!r.hasReplied) return false;
      } else if (engagementFilter === "OPENED") {
        if (r.openCount === 0 && r.status !== "OPENED" && r.status !== "CLICKED") return false;
      } else if (engagementFilter === "CLICKED") {
        if (r.clickCount === 0 && r.status !== "CLICKED") return false;
      } else if (engagementFilter === "UNOPENED") {
        if (r.openCount > 0 || r.status === "BOUNCED" || r.status === "FAILED") return false;
      } else if (engagementFilter === "BOUNCED") {
        if (r.status !== "BOUNCED" && r.status !== "FAILED") return false;
      }

      // 3. CRM Lead Pipeline State
      if (crmStatusFilter === "UNPROMOTED") {
        if (r.leadId) return false;
      } else if (crmStatusFilter === "IN_CRM") {
        if (!r.leadId) return false;
      }

      // 4. Source Filter
      if (sourceFilter === "CSV_UPLOAD") {
        if (r.source !== "CSV_UPLOAD") return false;
      } else if (sourceFilter === "CRM_DATABASE") {
        if (r.source !== "CRM_DATABASE") return false;
      }

      return true;
    });
  }, [recipients, search, engagementFilter, crmStatusFilter, sourceFilter]);

  // Paginated slice
  const totalItems = filtered.length;
  const paginatedRecipients = useMemo(() => {
    return filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filtered, currentPage, pageSize]);

  // Determine target leads for upload & export (Selected Checkboxes take precedence over Filtered View)
  const isSelectionActive = selectedIds.size > 0;
  const targetLeadsForAction = useMemo(() => {
    if (isSelectionActive) {
      return recipients.filter((r) => selectedIds.has(r.id));
    }
    return filtered;
  }, [isSelectionActive, selectedIds, recipients, filtered]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleEngagementFilterChange = (filter: EngagementFilterType) => {
    setEngagementFilter(filter);
    setCurrentPage(1);
    setSelectedIds(new Set()); // Reset checkboxes when changing filters
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleSelectAllOnPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = new Set(selectedIds);
    if (e.target.checked) {
      paginatedRecipients.forEach((r) => next.add(r.id));
    } else {
      paginatedRecipients.forEach((r) => next.delete(r.id));
    }
    setSelectedIds(next);
  };

  const handleToggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const isAllPageSelected =
    paginatedRecipients.length > 0 && paginatedRecipients.every((r) => selectedIds.has(r.id));

  const handlePromote = async (id: string) => {
    setPromotingId(id);
    try {
      await onPromoteRecipient(id);
      toast.success("Recipient successfully promoted to CRM Lead!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to promote recipient");
    } finally {
      setPromotingId(null);
    }
  };

  // Execute Bulk Upload / Push to Pre-Sales CRM
  const handleExecuteUploadToCrm = async () => {
    const targetIds = targetLeadsForAction.map((r) => r.id);
    if (targetIds.length === 0) {
      toast.info("No leads match the current selection or filter.");
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    setIsBulkAssigning(true);

    try {
      const res = await fetch(`${baseUrl}/api/marketing/campaigns/leads/bulk-assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recipientIds: targetIds }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || "Failed to bulk assign leads");
      }

      const result = await res.json();
      toast.success(
        `Successfully uploaded to Pre-Sales: ${result.newlyCreated} created, ${result.alreadyExisted} already in CRM!`,
        {
          action: {
            label: "Open Queue",
            onClick: () => {
              window.location.href = "/dashboard/pre-sales-manager/new-leads";
            },
          },
        }
      );

      setSelectedIds(new Set());
      setIsConfirmModalOpen(false);

      // Trigger parent reload
      if (targetIds[0]) {
        await onPromoteRecipient(targetIds[0]).catch(() => { });
      }
    } catch (err: any) {
      toast.error(err?.message || "Bulk lead assignment failed");
    } finally {
      setIsBulkAssigning(false);
    }
  };

  // Smart CSV Export
  const handleExportCsv = () => {
    const leadsToExport = targetLeadsForAction;

    if (leadsToExport.length === 0) {
      toast.info("No recipient records match the current filter.");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Audience Source",
      "Status",
      "Has Replied",
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
        ...leadsToExport.map((row) =>
          [
            escapeCsv(row.name || "Prospect"),
            escapeCsv(row.email),
            escapeCsv(row.phone || "N/A"),
            escapeCsv(row.source),
            escapeCsv(row.status),
            escapeCsv(row.hasReplied ? "YES" : "NO"),
            row.openCount,
            row.clickCount,
            escapeCsv(row.leadId ? "CRM_LEAD" : "UNPROMOTED"),
            escapeCsv(row.sentAt ? new Date(row.sentAt).toLocaleString() : "N/A"),
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const filterTag = engagementFilter.toLowerCase();
    const filename = `leads-${campaignTitle ? campaignTitle.toLowerCase().replace(/\s+/g, "-") : "campaign"}-${filterTag}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${leadsToExport.length} leads to CSV (${filterTag.toUpperCase()})!`);
  };

  // Helper labels for dynamic button text
  const getFilterLabel = () => {
    if (isSelectionActive) return `Selected (${selectedIds.size})`;
    if (engagementFilter === "REPLIED") return `Replied (${filtered.length})`;
    if (engagementFilter === "OPENED") return `Opened (${filtered.length})`;
    if (engagementFilter === "CLICKED") return `Clicked (${filtered.length})`;
    if (engagementFilter === "UNOPENED") return `Unopened (${filtered.length})`;
    if (engagementFilter === "BOUNCED") return `Bounced (${filtered.length})`;
    if (filtered.length < recipients.length) return `Filtered (${filtered.length})`;
    return `All (${recipients.length})`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs space-y-4 p-5">
      {/* ── 1. Top Filter Tabs with Real-Time Counter Badges ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--brand-600)]" />
              <span>Recipient Engagement & Audience Drill-Down</span>
            </h4>
            <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
              Filter by opens, replies, or clicks to download CSVs or upload qualified leads straight into the Pre-Sales CRM.
            </p>
          </div>

          {/* Quick Counter Summary */}
          <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
            <span>Showing:</span>
            <span className="text-[var(--brand-600)] font-black tabular-nums">{filtered.length}</span>
            <span>of</span>
            <span className="text-slate-800 font-black tabular-nums">{recipients.length}</span>
            <span>Leads</span>
          </div>
        </div>

        {/* Engagement Filter Chips Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 overflow-x-auto shadow-2xs">
          {[
            { id: "ALL", label: "All Leads", count: liveCounts.all, icon: Users, color: "text-slate-600" },
            { id: "REPLIED", label: "Replied", count: liveCounts.replied, icon: MessageSquare, color: "text-purple-600" },
            { id: "OPENED", label: "Opened Mail", count: liveCounts.opened, icon: Eye, color: "text-blue-600" },
            { id: "CLICKED", label: "Clicked Links", count: liveCounts.clicked, icon: MousePointer, color: "text-emerald-600" },
            { id: "UNOPENED", label: "Unopened (Cold)", count: liveCounts.unopened, icon: Mail, color: "text-amber-600" },
            { id: "BOUNCED", label: "Bounced / Failed", count: liveCounts.bounced, icon: AlertTriangle, color: "text-red-500" },
          ].map((tab) => {
            const isActive = engagementFilter === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleEngagementFilterChange(tab.id as EngagementFilterType)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                  isActive
                    ? "bg-white text-[var(--text-primary)] shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", tab.color)} />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-mono tabular-nums font-black",
                    isActive
                      ? "bg-purple-100 text-[var(--brand-700)]"
                      : "bg-slate-200 text-slate-600"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Action Toolbar & Secondary Controls ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          {/* Text Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* CRM Status Dropdown */}
          <select
            value={crmStatusFilter}
            onChange={(e) => {
              setCrmStatusFilter(e.target.value as CrmFilterType);
              setCurrentPage(1);
            }}
            className="h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] cursor-pointer"
          >
            <option value="ALL">All CRM States</option>
            <option value="UNPROMOTED">Not Yet in CRM (Unpromoted)</option>
            <option value="IN_CRM">Already in CRM (Active Leads)</option>
          </select>

          {/* Audience Source Dropdown */}
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value as SourceFilterType);
              setCurrentPage(1);
            }}
            className="h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] cursor-pointer"
          >
            <option value="ALL">All Sources</option>
            <option value="CSV_UPLOAD">CSV Upload Leads</option>
            <option value="CRM_DATABASE">CRM Database Leads</option>
          </select>
        </div>

        {/* Dynamic Action Buttons (Export & Upload to Pre-Sales) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            className="h-8 px-3 text-xs font-bold gap-1.5 text-slate-700 hover:text-slate-900 border-slate-200 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export {getFilterLabel()} (CSV)</span>
          </Button>

          {/* Smart Upload Button */}
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsConfirmModalOpen(true)}
            disabled={filtered.length === 0 || isBulkAssigning}
            className="h-8 px-3.5 text-xs font-bold gap-1.5 shadow-2xs bg-brand-600 hover:bg-brand-700 text-white"
          >
            <UserCog className="w-3.5 h-3.5" />
            <span>Upload {getFilterLabel()} to Pre-Sales</span>
          </Button>
        </div>
      </div>

      {/* ── 3. Table Rows ── */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full text-left text-xs text-[var(--text-secondary)]">
          <thead className="bg-slate-50/90 font-extrabold uppercase text-[var(--text-tertiary)] tracking-wider border-b border-slate-200/80 text-[11px]">
            <tr>
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllPageSelected}
                  onChange={handleSelectAllOnPage}
                  aria-label="Select all recipients on this page"
                  className="rounded border-slate-300 text-[var(--brand-600)] focus:ring-[var(--brand-500)] cursor-pointer"
                />
              </th>
              <th className="py-3 px-3">Lead Contact</th>
              <th className="py-3 px-3">Audience Source</th>
              <th className="py-3 px-3">Engagement Status</th>
              <th className="py-3 px-3 text-center">Opens</th>
              <th className="py-3 px-3 text-center">Clicks</th>
              <th className="py-3 px-3 text-right">Lead Pipeline Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {paginatedRecipients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Filter className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                    <p className="text-xs font-semibold text-slate-600">No leads match the selected filter</p>
                    <p className="text-[11px] text-slate-400">
                      Try clearing the search or switching to "All Leads".
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRecipients.map((r) => {
                const isSelected = selectedIds.has(r.id);
                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-slate-50/70 transition-colors ${isSelected ? "bg-purple-50/40" : ""
                      }`}
                  >
                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleOne(r.id)}
                        aria-label={`Select ${r.name || r.email}`}
                        className="rounded border-slate-300 text-[var(--brand-600)] focus:ring-[var(--brand-500)] cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[var(--text-primary)]">
                          {r.name || "Anonymous Prospect"}
                        </span>
                        {r.hasReplied && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 font-bold text-[10px]">
                            <MessageSquare className="w-2.5 h-2.5" />
                            <span>Replied</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-medium text-[var(--text-tertiary)]">{r.email}</div>
                      {r.phone && (
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5">{r.phone}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      {r.source === "CSV_UPLOAD" ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold text-[10px]">
                          <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                          <span>CSV Upload</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 text-[var(--brand-700)] border border-purple-200/80 font-bold text-[10px]">
                          <Users className="w-3 h-3 text-[var(--brand-600)]" />
                          <span>CRM Database</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      {r.hasReplied ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                          <MessageSquare className="w-3 h-3" />
                          <span>Replied to Email</span>
                        </span>
                      ) : r.clickCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <MousePointer className="w-3 h-3" />
                          <span>Clicked ({r.clickCount})</span>
                        </span>
                      ) : r.openCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                          <Eye className="w-3 h-3" />
                          <span>Opened ({r.openCount})</span>
                        </span>
                      ) : r.status === "BOUNCED" || r.status === "FAILED" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Bounced</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          <Mail className="w-3 h-3" />
                          <span>Delivered (Unopened)</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="font-extrabold text-[var(--text-primary)] tabular-nums">
                        {r.openCount}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`font-extrabold tabular-nums ${r.clickCount > 0 ? "text-emerald-600 font-black" : "text-slate-400"
                          }`}
                      >
                        {r.clickCount}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      {r.leadId ? (
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Active in CRM</span>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePromote(r.id)}
                          disabled={promotingId === r.id}
                          className="h-7 px-2.5 text-[11px] font-bold gap-1 text-[var(--brand-600)] hover:bg-purple-50"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{promotingId === r.id ? "Promoting..." : "Promote to Lead"}</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── 4. Universal Pagination ── */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50, 100]}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* ── 5. Smart Confirmation Modal for Uploading to Pre-Sales CRM ── */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-brand-600 flex items-center justify-center">
                  <UserCog className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Upload Leads to Pre-Sales CRM</h3>
                  <p className="text-[11px] text-slate-500">
                    Routing to Pre-Sales Manager triage queue
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                You are about to push <strong className="text-slate-900 font-extrabold">{targetLeadsForAction.length} leads</strong> into the CRM Pre-Sales queue.
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Filter Applied:</span>
                  <span className="font-bold text-slate-800">{getFilterLabel()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Audience Scope:</span>
                  <span className="font-bold text-slate-800">{campaignTitle || "Current Campaign"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Assigned State:</span>
                  <span className="font-bold text-emerald-600">Unassigned Manager Triage (HOT)</span>
                </div>
              </div>

              <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl text-purple-900 text-[11px] space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                  <span>Automatic Sales Conversion</span>
                </p>
                <p className="text-purple-800/90">
                  Any audience contacts not yet in the CRM will be converted into new Lead records with status set to <code className="font-mono font-bold">INTERESTED</code> and temperature marked <code className="font-mono font-bold">HOT</code>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isBulkAssigning}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleExecuteUploadToCrm}
                disabled={isBulkAssigning}
                className="text-xs bg-brand-600 hover:bg-brand-700 text-white font-bold gap-1.5"
              >
                {isBulkAssigning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UserPlus className="w-3.5 h-3.5" />
                )}
                <span>Upload {targetLeadsForAction.length} Leads Now</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
