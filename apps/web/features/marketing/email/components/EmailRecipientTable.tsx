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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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
  isLoading?: boolean;
}

export function EmailRecipientTable({
  recipients,
  onPromoteRecipient,
  isLoading,
}: EmailRecipientTableProps) {
  const [search, setSearch] = useState("");
  const [promotingId, setPromotingId] = useState<string | null>(null);

  const filtered = recipients.filter((r) => {
    return (
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      (r.name && r.name.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const handlePromote = async (id: string) => {
    setPromotingId(id);
    try {
      await onPromoteRecipient(id);
    } finally {
      setPromotingId(null);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-extrabold text-[var(--text-primary)]">Recipient Engagement Drill-down</h4>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Track individual lead responses and promote high-intent prospects to sales leads.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search recipients by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:bg-white transition-all shadow-xs"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[var(--text-secondary)]">
          <thead className="bg-slate-50/90 font-extrabold uppercase text-[var(--text-tertiary)] tracking-wider border-b border-slate-200/80 text-[11px]">
            <tr>
              <th className="py-3 px-3">Lead Contact</th>
              <th className="py-3 px-3">Audience Source</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-center">Opens</th>
              <th className="py-3 px-3 text-center">Clicks</th>
              <th className="py-3 px-3 text-right">Lead Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">
                  No recipient engagement data found
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
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
    </div>
  );
}
