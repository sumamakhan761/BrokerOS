"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  Eye,
  MousePointer,
  AlertTriangle,
  UserCheck,
  UserPlus,
  ArrowUpRight,
  FileSpreadsheet,
  Download,
  Send,
  UserCog,
  CheckSquare,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";

export interface EmailRecipientRow {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  status: string;
  source: string;
  openCount: number;
  clickCount: number;
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

export interface EmailRecipientTableProps {
  recipients: EmailRecipientRow[];
  onPromoteRecipient: (recipientId: string) => Promise<void>;
  campaignId?: string;
  campaignTitle?: string;
  isLoading?: boolean;
}

export function EmailRecipientTable({
  recipients,
  onPromoteRecipient,
  campaignId,
  campaignTitle,
  isLoading,
}: EmailRecipientTableProps) {
  const [search, setSearch] = useState("");
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const filtered = recipients.filter((r) => {
    return (
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      (r.name && r.name.toLowerCase().includes(search.toLowerCase())) ||
      (r.phone && r.phone.includes(search))
    );
  });

  // Paginated window
  const totalItems = filtered.length;
  const paginatedRecipients = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
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
    paginatedRecipients.length > 0 &&
    paginatedRecipients.every((r) => selectedIds.has(r.id));

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

  // Bulk assign to Pre-Sales Manager
  const handleBulkAssignToPreSales = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const targetIds = selectedIds.size > 0
      ? Array.from(selectedIds)
      : recipients.filter((r) => !r.leadId).map((r) => r.id);

    if (targetIds.length === 0) {
      toast.info("All leads in this campaign are already active in the CRM.");
      return;
    }

    const confirmed = window.confirm(
      `Push ${targetIds.length} recipient${targetIds.length === 1 ? "" : "s"} to Pre-Sales Manager unassigned intake queue?`
    );
    if (!confirmed) return;

    setIsBulkAssigning(true);
    try {
      const payload = selectedIds.size > 0
        ? { recipientIds: targetIds }
        : campaignId
        ? { campaignIds: [campaignId] }
        : { recipientIds: targetIds };

      const res = await fetch(`${baseUrl}/api/marketing/campaigns/leads/bulk-assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || "Failed to bulk assign leads");
      }

      const result = await res.json();
      toast.success(
        `Assigned to Pre-Sales: ${result.newlyCreated} created, ${result.alreadyExisted} already in CRM.`
      );
      setSelectedIds(new Set());
      // Re-trigger individual promote callback or parent reload
      if (targetIds[0]) {
        await onPromoteRecipient(targetIds[0]).catch(() => {});
      }
    } catch (err: any) {
      toast.error(err?.message || "Bulk lead assignment failed");
    } finally {
      setIsBulkAssigning(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const dataToExport = filtered.map((r) => ({
      name: r.name || "Prospect",
      email: r.email,
      phone: r.phone || "N/A",
      source: r.source,
      status: r.status,
      openCount: r.openCount,
      clickCount: r.clickCount,
      leadStatus: r.leadId ? "CRM_LEAD" : "UNPROMOTED",
      sentAt: r.sentAt ? new Date(r.sentAt).toLocaleString() : "N/A",
    }));

    if (dataToExport.length === 0) {
      toast.info("No recipient records to export.");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Audience Source",
      "Status",
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
        ...dataToExport.map((row) =>
          [
            escapeCsv(row.name),
            escapeCsv(row.email),
            escapeCsv(row.phone),
            escapeCsv(row.source),
            escapeCsv(row.status),
            row.openCount,
            row.clickCount,
            escapeCsv(row.leadStatus),
            escapeCsv(row.sentAt),
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const filename = `campaign-${campaignTitle ? campaignTitle.toLowerCase().replace(/\s+/g, "-") : "recipients"}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${dataToExport.length} recipients to CSV!`);
  };

  const getStatusBadgeVariant = (status: string): "success" | "brand" | "danger" | "default" => {
    switch (status) {
      case "CLICKED":
        return "success";
      case "OPENED":
        return "brand";
      case "BOUNCED":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs space-y-4 p-5">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-extrabold text-[var(--text-primary)]">Recipient Engagement Drill-down</h4>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Track individual prospect responses and push high-intent recipients to Pre-Sales Manager queue.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search recipients..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-2xs"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="h-8 px-2.5 text-xs font-bold gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleBulkAssignToPreSales}
            disabled={isBulkAssigning}
            className="h-8 px-3 text-xs font-bold gap-1.5 shadow-2xs"
          >
            <UserCog className={`w-3.5 h-3.5 ${isBulkAssigning ? "animate-spin" : ""}`} />
            <span>
              {selectedIds.size > 0
                ? `Assign Selected (${selectedIds.size}) to Pre-Sales`
                : "Assign All to Pre-Sales"}
            </span>
          </Button>
        </div>
      </div>

      {/* Recipient Rows Table */}
      <div className="overflow-x-auto">
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
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-center">Opens</th>
              <th className="py-3 px-3 text-center">Clicks</th>
              <th className="py-3 px-3 text-right">Lead Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {paginatedRecipients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[var(--text-muted)]">
                  No recipient engagement data found
                </td>
              </tr>
            ) : (
              paginatedRecipients.map((r) => {
                const isSelected = selectedIds.has(r.id);
                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isSelected ? "bg-purple-50/40" : ""
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
                      <div className="font-extrabold text-[var(--text-primary)]">{r.name || "Anonymous Prospect"}</div>
                      <div className="text-[11px] font-medium text-[var(--text-tertiary)]">{r.email}</div>
                      {r.phone && (
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5">{r.phone}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      {r.source === "CSV_UPLOAD" ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold text-[10px]">
                          <FileSpreadsheet className="w-3 h-3" />
                          <span>CSV Audience</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-[var(--brand-700)] border border-purple-200/80 font-bold text-[10px]">
                          <Users className="w-3 h-3" />
                          <span>CRM Database</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <Badge variant={getStatusBadgeVariant(r.status)} className="text-[10px]">
                        {r.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="font-extrabold text-[var(--text-primary)] tabular-nums">
                        {Math.max(r.openCount || 0, r.clickCount > 0 ? 1 : 0)}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`font-extrabold tabular-nums ${
                          r.clickCount > 0 ? "text-emerald-600 font-black" : "text-slate-400"
                        }`}
                      >
                        {r.clickCount}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      {r.leadId ? (
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Active CRM Lead</span>
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

      {/* Universal Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50, 100]}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
