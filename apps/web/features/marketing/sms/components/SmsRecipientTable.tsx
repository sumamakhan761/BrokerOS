"use client";

import React, { useState } from "react";
import {
  Phone,
  Search,
  UserCheck,
  UserPlus,
  FileSpreadsheet,
  Users,
} from "lucide-react";
import type { SmsRecipientItem } from "@/features/marketing/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface SmsRecipientTableProps {
  recipients: SmsRecipientItem[];
  loading?: boolean;
  onPromote?: (recipientId: string) => Promise<void>;
}

export function SmsRecipientTable({
  recipients,
  loading,
  onPromote,
}: SmsRecipientTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [promotingId, setPromotingId] = useState<string | null>(null);

  const filtered = recipients.filter((r) => {
    const matchesSearch =
      r.phone.includes(search) ||
      (r.name && r.name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "CLICKED" && r.clickCount > 0) ||
      r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePromote = async (id: string) => {
    if (!onPromote) return;
    setPromotingId(id);
    try {
      await onPromote(id);
    } finally {
      setPromotingId(null);
    }
  };

  const getStatusBadgeVariant = (status: string, clickCount: number): "success" | "brand" | "danger" | "default" => {
    if (clickCount > 0) return "success";
    switch (status) {
      case "DELIVERED":
        return "brand";
      case "FAILED":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs space-y-4 p-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-extrabold text-[var(--text-primary)]">
            Recipient Telemetry & Lead Conversion
          </h4>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Track handset acknowledgment, shortlink clicks, and promote high-intent prospects to CRM leads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by phone number or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            {["ALL", "DELIVERED", "CLICKED", "FAILED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all ${
                  statusFilter === st
                    ? "bg-white text-[var(--text-primary)] shadow-xs"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {st === "ALL" ? "All Statuses" : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[var(--text-secondary)]">
          <thead className="bg-slate-50/90 font-extrabold uppercase text-[var(--text-tertiary)] tracking-wider border-b border-slate-200/80 text-[11px]">
            <tr>
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
                <td colSpan={7} className="py-8 text-center text-[var(--text-muted)]">
                  Loading recipient telemetry...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[var(--text-muted)]">
                  No recipient engagement data matching current filter
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const statusLabel =
                  r.clickCount > 0 ? "CLICKED LINK" : r.status;

                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-[var(--text-primary)] font-mono">
                            {r.phone}
                          </div>
                          {r.name && (
                            <div className="text-[11px] font-medium text-[var(--text-tertiary)]">
                              {r.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      {r.source === "CSV_UPLOAD" ? (
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
                    </td>

                    <td className="py-3.5 px-3">
                      <Badge
                        variant={getStatusBadgeVariant(r.status, r.clickCount)}
                        className="text-[10px] uppercase font-extrabold"
                      >
                        {statusLabel}
                      </Badge>
                      {r.failReason && (
                        <span className="block text-[10px] text-rose-500 mt-0.5" title={r.failReason}>
                          {r.failReason}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="font-mono font-bold text-[var(--text-primary)] tabular-nums">
                        {r.segmentsCount || 1}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`font-extrabold tabular-nums ${
                          r.clickCount > 0 ? "text-emerald-600 font-black" : "text-slate-400"
                        }`}
                      >
                        {r.clickCount || 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-[11px] font-medium text-[var(--text-tertiary)]">
                      {r.firstClickedAt
                        ? new Date(r.firstClickedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      {r.leadId ? (
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Active CRM Lead</span>
                        </div>
                      ) : onPromote ? (
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
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
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
