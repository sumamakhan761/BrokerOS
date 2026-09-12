"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Search,
  Download,
  Loader2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import type { MetaAcquiredLeadItem } from "../types";

interface MetaAcquiredLeadsTableProps {
  leads: MetaAcquiredLeadItem[];
  campaignName?: string;
  campaignId?: string;
  onRefresh?: () => void;
}

export function MetaAcquiredLeadsTable({
  leads,
  campaignName,
  campaignId,
  onRefresh,
}: MetaAcquiredLeadsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPushing, setIsPushing] = useState(false);

  // Search filter across acquired leads
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return leads;
    const term = searchTerm.toLowerCase();

    return leads.filter((item) => {
      const l = item.lead;
      if (!l) return false;

      const matchesName = l.name.toLowerCase().includes(term);
      const matchesPhone = l.phone.toLowerCase().includes(term);
      const matchesEmail = l.email ? l.email.toLowerCase().includes(term) : false;
      const matchesCity = l.city ? l.city.toLowerCase().includes(term) : false;
      const matchesForm = item.formId ? item.formId.toLowerCase().includes(term) : false;

      return matchesName || matchesPhone || matchesEmail || matchesCity || matchesForm;
    });
  }, [leads, searchTerm]);

  // Lead IDs in filtered view
  const filteredLeadIds = useMemo(() => {
    return filtered
      .map((item) => item.lead?.id)
      .filter((id): id is string => Boolean(id));
  }, [filtered]);

  const isAllSelected =
    filteredLeadIds.length > 0 &&
    filteredLeadIds.every((id) => selectedIds.has(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const next = new Set(selectedIds);
      filteredLeadIds.forEach((id) => next.delete(id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      filteredLeadIds.forEach((id) => next.add(id));
      setSelectedIds(next);
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // CSV escape helper
  const escapeCsv = (str?: string | number | null) => {
    if (str == null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  // 1-Click CSV Export
  const handleExportCsv = (exportOnlySelected = false) => {
    const targetItems = exportOnlySelected
      ? filtered.filter((item) => item.lead?.id && selectedIds.has(item.lead.id))
      : filtered;

    if (targetItems.length === 0) {
      toast.error("No leads available to export");
      return;
    }

    const headers = [
      "Prospect Name",
      "Phone",
      "Email",
      "City",
      "Budget (INR)",
      "Allocation Status",
      "Form ID",
      "Captured At",
    ];

    const rows = targetItems.map((item) => {
      const l = item.lead!;
      const allocationStatus = l.assignedUser?.name
        ? `Assigned (${l.assignedUser.name})`
        : "Unassigned (Pre-Sales Queue)";

      return [
        escapeCsv(l.name),
        escapeCsv(l.phone),
        escapeCsv(l.email || "N/A"),
        escapeCsv(l.city || "N/A"),
        escapeCsv(l.budget ? l.budget.toString() : "N/A"),
        escapeCsv(allocationStatus),
        escapeCsv(item.formId || "N/A"),
        escapeCsv(new Date(item.capturedAt).toLocaleString()),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = (campaignName || "meta-ads")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    link.href = url;
    link.download = `${safeName}-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${targetItems.length} leads to CSV!`);
  };

  // Bulk Push to Pre-Sales Manager Intake Queue
  const handlePushToPreSales = async (onlySelected = true) => {
    const idsToPush = onlySelected ? Array.from(selectedIds) : filteredLeadIds;

    if (idsToPush.length === 0) {
      toast.error("Please select at least one lead to push to Pre-Sales");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to push ${idsToPush.length} lead${idsToPush.length === 1 ? "" : "s"} to the Pre-Sales Manager intake queue (/dashboard/pre-sales-manager/new-leads)?`
    );
    if (!confirmed) return;

    try {
      setIsPushing(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

      const res = await fetch(`${baseUrl}/api/marketing/ads/meta/leads/bulk-assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          leadIds: idsToPush,
          campaignId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || "Failed to push leads to Pre-Sales");
      }

      const result = await res.json();
      toast.success(
        `Pushed to Pre-Sales: ${result.assignedCount ?? idsToPush.length} leads routed to Pre-Sales queue!`,
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
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to assign prospects to Pre-Sales");
    } finally {
      setIsPushing(false);
    }
  };

  if (!leads || leads.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200/80">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto text-blue-600 mb-2 shadow-xs">
          <Users className="w-6 h-6" />
        </div>
        <p className="text-xs font-extrabold text-[var(--text-primary)]">No Leads Captured Yet</p>
        <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
          Submissions from Meta Instant Lead Forms will appear here automatically in real-time.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs space-y-0">
      {/* Top Search & Actions Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        {/* Search Box */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search leads by name, phone, email, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8.5 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Global Counter & CSV Export */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <span className="text-xs font-bold text-[var(--text-tertiary)] whitespace-nowrap">
            Showing {filtered.length} of {leads.length} leads
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportCsv(selectedIds.size > 0)}
            className="gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {selectedIds.size > 0
                ? `Export Selected (${selectedIds.size})`
                : "Export to CSV"}
            </span>
          </Button>
        </div>
      </div>

      {/* Bulk Action Sticky Bar (When leads are selected) */}
      {selectedIds.size > 0 && (
        <div className="bg-purple-50/90 border-b border-purple-200/80 px-4 py-2.5 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-purple-600 text-white text-[11px] font-extrabold flex items-center justify-center shadow-xs">
              {selectedIds.size}
            </span>
            <span className="text-xs font-bold text-purple-900">
              {selectedIds.size} new lead{selectedIds.size === 1 ? "" : "s"} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handlePushToPreSales(true)}
              disabled={isPushing}
              className="gap-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
            >
              {isPushing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserPlus className="w-3.5 h-3.5" />
              )}
              <span>Push Selected to Pre-Sales</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="text-xs font-bold text-purple-700 hover:bg-purple-100/60 border-purple-200"
            >
              Deselect All
            </Button>
          </div>
        </div>
      )}

      {/* Table Feed */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[var(--text-tertiary)] font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  aria-label="Select all leads"
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-4">Prospect</th>
              <th className="py-3.5 px-4">Contact</th>
              <th className="py-3.5 px-4">City & Budget</th>
              <th className="py-3.5 px-4">Pre-Sales Allocation</th>
              <th className="py-3.5 px-4 text-right">Captured At</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[var(--text-primary)]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <span>No leads match the search term &quot;{searchTerm}&quot;.</span>
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const lead = item.lead;
                if (!lead) return null;
                const isSelected = selectedIds.has(lead.id);

                return (
                  <tr
                    key={item.logId || item.leadgenId || lead.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isSelected ? "bg-purple-50/30" : ""
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(lead.id)}
                        aria-label={`Select ${lead.name}`}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-[var(--text-primary)] text-xs">
                          {lead.name}
                        </span>
                        {item.formId && (
                          <span className="text-[10px] text-[var(--text-tertiary)] font-mono truncate max-w-[150px] mt-0.5">
                            Form: {item.formId}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-bold">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lead.phone}</span>
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] font-medium text-[11px]">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{lead.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lead.city || "Not Specified"}</span>
                        </div>
                        {lead.budget && (
                          <span className="text-[11px] font-bold text-emerald-600 block">
                            ₹{lead.budget.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-medium">
                      {lead.assignedUser ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span className="font-bold text-slate-700">
                            {lead.assignedUser.name || "Assigned"}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200">
                          Unassigned (Pre-Sales Queue)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right text-[11px] text-[var(--text-tertiary)] font-medium">
                      {new Date(item.capturedAt).toLocaleDateString()}{" "}
                      {new Date(item.capturedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/dashboard/sales-manager/lead-management/${lead.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <span>Open CRM</span>
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
