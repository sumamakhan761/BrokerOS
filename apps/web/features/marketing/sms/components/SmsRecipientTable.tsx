"use client";

import React, { useState, useMemo } from "react";
import {
  Phone,
  Search,
  UserCheck,
  UserPlus,
  FileSpreadsheet,
  Users,
  Download,
  UserCog,
  CheckCircle2,
  MousePointerClick,
  AlertTriangle,
  MessageSquare,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { SmsRecipientItem } from "@/features/marketing/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";

export interface SmsRecipientTableProps {
  recipients: SmsRecipientItem[];
  loading?: boolean;
  onPromote?: (recipientId: string) => Promise<void>;
  campaignId?: string;
  campaignTitle?: string;
}

export type SmsEngagementFilterType = "ALL" | "REPLIED" | "CLICKED" | "DELIVERED" | "FAILED";
export type SmsCrmFilterType = "ALL" | "UNPROMOTED" | "IN_CRM";
export type SmsSourceFilterType = "ALL" | "CSV_UPLOAD" | "CRM_DATABASE";

export function SmsRecipientTable({
  recipients,
  loading,
  onPromote,
  campaignId,
  campaignTitle,
}: SmsRecipientTableProps) {
  const [search, setSearch] = useState("");
  const [engagementFilter, setEngagementFilter] = useState<SmsEngagementFilterType>("ALL");
  const [crmStatusFilter, setCrmStatusFilter] = useState<SmsCrmFilterType>("ALL");
  const [sourceFilter, setSourceFilter] = useState<SmsSourceFilterType>("ALL");

  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Dynamic counts computed from recipient array
  const liveCounts = useMemo(() => {
    let delivered = 0;
    let clicked = 0;
    let replied = 0;
    let failed = 0;
    let inCrm = 0;

    recipients.forEach((r) => {
      if ((r as any).hasReplied) replied++;
      if (r.clickCount > 0) clicked++;
      if (r.status === "DELIVERED") delivered++;
      if (r.status === "FAILED") failed++;
      if (r.leadId) inCrm++;
    });

    const all = recipients.length;
    return {
      all,
      delivered,
      clicked,
      replied,
      failed,
      inCrm,
      unpromoted: all - inCrm,
    };
  }, [recipients]);

  const filtered = useMemo(() => {
    return recipients.filter((r) => {
      const matchesSearch =
        r.phone.includes(search) ||
        (r.name && r.name.toLowerCase().includes(search.toLowerCase()));

      let matchesEngagement = true;
      if (engagementFilter === "REPLIED") matchesEngagement = Boolean((r as any).hasReplied);
      else if (engagementFilter === "CLICKED") matchesEngagement = r.clickCount > 0;
      else if (engagementFilter === "DELIVERED") matchesEngagement = r.status === "DELIVERED";
      else if (engagementFilter === "FAILED") matchesEngagement = r.status === "FAILED";

      let matchesCrm = true;
      if (crmStatusFilter === "UNPROMOTED") matchesCrm = !r.leadId;
      else if (crmStatusFilter === "IN_CRM") matchesCrm = Boolean(r.leadId);

      let matchesSource = true;
      if (sourceFilter !== "ALL") matchesSource = r.source === sourceFilter;

      return matchesSearch && matchesEngagement && matchesCrm && matchesSource;
    });
  }, [recipients, search, engagementFilter, crmStatusFilter, sourceFilter]);

  const totalItems = filtered.length;
  const paginatedRecipients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleEngagementFilterChange = (filter: SmsEngagementFilterType) => {
    setEngagementFilter(filter);
    setCurrentPage(1);
  };

  const handleCrmFilterChange = (filter: SmsCrmFilterType) => {
    setCrmStatusFilter(filter);
    setCurrentPage(1);
  };

  const handleSourceFilterChange = (filter: SmsSourceFilterType) => {
    setSourceFilter(filter);
    setCurrentPage(1);
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
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

  const isAllOnPageSelected =
    paginatedRecipients.length > 0 &&
    paginatedRecipients.every((r) => selectedIds.has(r.id));

  const handlePromote = async (id: string) => {
    if (!onPromote) return;
    setPromotingId(id);
    try {
      await onPromote(id);
      toast.success("Recipient successfully promoted to CRM Lead!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to promote recipient");
    } finally {
      setPromotingId(null);
    }
  };

  // Bulk Export Selected
  const handleBulkExportSelected = () => {
    const selectedList = recipients.filter((r) => selectedIds.has(r.id));
    if (selectedList.length === 0) return;

    const headers = [
      "Recipient Name",
      "Phone",
      "Delivery Status",
      "Link Clicks",
      "Segments",
      "Source",
      "CRM Lead",
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
        ...selectedList.map((r) =>
          [
            escapeCsv(r.name || "Prospect"),
            escapeCsv(r.phone),
            escapeCsv(r.status),
            r.clickCount,
            r.segmentsCount || 1,
            escapeCsv(r.source),
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
      `sms-selected-recipients-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${selectedList.length} recipients to CSV!`);
  };

  // Bulk Assign Selected to Pre-Sales
  const handleBulkAssignSelected = async () => {
    if (selectedIds.size === 0 || !campaignId) return;

    const confirmed = window.confirm(
      `Are you sure you want to push ${selectedIds.size} selected prospects to the Pre-Sales unassigned lead queue?`
    );
    if (!confirmed) return;

    setIsBulkAssigning(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

    try {
      const res = await fetch(`${baseUrl}/api/marketing/sms/campaigns/leads/bulk-assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          campaignIds: [campaignId],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || "Failed to assign leads to Pre-Sales");
      }

      const result = await res.json();
      toast.success(
        `Pushed to Pre-Sales: ${result.newlyCreated} created, ${result.alreadyExisted} already existed!`,
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
    } catch (err: any) {
      toast.error(err?.message || "Failed to assign prospects to Pre-Sales");
    } finally {
      setIsBulkAssigning(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs space-y-4 p-5">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-extrabold text-[var(--text-primary)]">
            Recipient Telemetry & Lead Conversion
          </h4>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Track handset acknowledgment, shortlink clicks, and promote high-intent prospects to CRM leads.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by phone or prospect name..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-xs"
          />
        </div>
      </div>

      {/* ── Drilldown Filters: Engagement, CRM Status, Source ── */}
      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100">
        {/* Engagement Chips */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 overflow-x-auto">
          {[
            { id: "ALL", label: `All (${liveCounts.all})` },
            { id: "CLICKED", label: `Clicked (${liveCounts.clicked})` },
            { id: "DELIVERED", label: `Delivered (${liveCounts.delivered})` },
            { id: "REPLIED", label: `Replied (${liveCounts.replied})` },
            { id: "FAILED", label: `Failed (${liveCounts.failed})` },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => handleEngagementFilterChange(chip.id as SmsEngagementFilterType)}
              className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all ${
                engagementFilter === chip.id
                  ? "bg-white text-[var(--text-primary)] shadow-xs"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* CRM Status Chips */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          {[
            { id: "ALL", label: "All Records" },
            { id: "UNPROMOTED", label: `Unpromoted (${liveCounts.unpromoted})` },
            { id: "IN_CRM", label: `In CRM (${liveCounts.inCrm})` },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => handleCrmFilterChange(chip.id as SmsCrmFilterType)}
              className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all ${
                crmStatusFilter === chip.id
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Audience Source Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          {[
            { id: "ALL", label: "All Sources" },
            { id: "CSV_UPLOAD", label: "CSV Lists" },
            { id: "CRM_DATABASE", label: "CRM Leads" },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => handleSourceFilterChange(chip.id as SmsSourceFilterType)}
              className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all ${
                sourceFilter === chip.id
                  ? "bg-white text-[var(--text-primary)] shadow-xs"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Selected Toolbar */}
      {selectedIds.size > 0 && (
        <div className="p-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-xs">
              {selectedIds.size}
            </span>
            <span className="text-xs font-extrabold text-white">Prospects Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkExportSelected}
              className="h-7 px-2.5 text-xs font-bold gap-1 bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Download className="w-3 h-3" />
              <span>Export CSV</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleBulkAssignSelected}
              disabled={isBulkAssigning}
              className="h-7 px-3 text-xs font-bold gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950"
            >
              <UserCog className="w-3.5 h-3.5" />
              <span>{isBulkAssigning ? "Assigning..." : "Assign to Pre-Sales"}</span>
            </Button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
        <table className="w-full text-left text-xs text-[var(--text-secondary)]">
          <thead className="bg-slate-50/90 font-extrabold uppercase text-[var(--text-tertiary)] tracking-wider border-b border-slate-200/80 text-[10px]">
            <tr>
              <th className="py-3 px-3 w-8 text-center">
                <input
                  type="checkbox"
                  checked={isAllOnPageSelected}
                  onChange={handleSelectAllOnPage}
                  aria-label="Select all prospects on page"
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3">Recipient Contact</th>
              <th className="py-3 px-3">Audience Source</th>
              <th className="py-3 px-3">Delivery Status</th>
              <th className="py-3 px-3 text-center">Segments</th>
              <th className="py-3 px-3 text-center">Link Clicks</th>
              <th className="py-3 px-3">First Clicked</th>
              <th className="py-3 px-3 text-right">Lead Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[var(--text-muted)]">
                  Loading recipient telemetry...
                </td>
              </tr>
            ) : paginatedRecipients.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[var(--text-muted)]">
                  No recipient engagement data matching current filter
                </td>
              </tr>
            ) : (
              paginatedRecipients.map((r) => {
                const isSelected = selectedIds.has(r.id);
                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isSelected ? "bg-amber-50/40" : ""
                    }`}
                  >
                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(r.id)}
                        aria-label={`Select recipient ${r.phone}`}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-[var(--text-primary)] font-mono">
                            {r.phone}
                          </div>
                          <div className="text-[11px] font-medium text-[var(--text-tertiary)]">
                            {r.name || "Prospect"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      {r.source === "CSV_UPLOAD" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <FileSpreadsheet className="w-3 h-3" />
                          <span>CSV Upload</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          <Users className="w-3 h-3" />
                          <span>CRM Database</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                          r.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : r.status === "FAILED"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {r.clickCount > 0 ? "CLICKED LINK" : r.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="font-mono font-extrabold text-[11px] text-[var(--text-primary)]">
                        {r.segmentsCount || 1}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`font-extrabold text-xs tabular-nums ${
                          r.clickCount > 0 ? "text-amber-600" : "text-slate-400"
                        }`}
                      >
                        {r.clickCount}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-[11px] text-[var(--text-muted)]">
                      {r.firstClickedAt
                        ? new Date(r.firstClickedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      {r.leadId ? (
                        <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                          <UserCheck className="w-3 h-3" />
                          <span>CRM Lead</span>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={promotingId === r.id}
                          onClick={() => handlePromote(r.id)}
                          className="h-7 px-2.5 text-[11px] font-extrabold gap-1 text-amber-700 border-amber-300 hover:bg-amber-50"
                        >
                          <UserPlus className="w-3 h-3" />
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

      {/* Universal Pagination */}
      <div className="pt-2">
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </div>
    </div>
  );
}
