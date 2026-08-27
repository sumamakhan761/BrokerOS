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

interface RecipientRow {
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

interface RecipientActivityTableProps {
  recipients: RecipientRow[];
  onPromoteRecipient: (recipientId: string) => Promise<void>;
  isLoading?: boolean;
}

export function RecipientActivityTable({
  recipients,
  onPromoteRecipient,
  isLoading,
}: RecipientActivityTableProps) {
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

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-xs space-y-4 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Recipient Engagement Drill-down</h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Track individual lead responses and promote high-intent prospects to sales leads.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search recipients by email/name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-zinc-300">
          <thead className="bg-slate-50 dark:bg-zinc-800/60 font-semibold uppercase text-slate-500 dark:text-zinc-400 tracking-wider border-b border-slate-200/80 dark:border-zinc-800">
            <tr>
              <th className="py-3 px-3">Lead Contact</th>
              <th className="py-3 px-3">Audience Source</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-center">Opens</th>
              <th className="py-3 px-3 text-center">Clicks</th>
              <th className="py-3 px-3 text-right">Lead Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No recipient activity found matching filter.
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const isEngaged = row.openCount > 1 || row.clickCount > 0;
                const isLinked = !!row.leadId;

                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors ${
                      isEngaged ? "bg-sky-50/20 dark:bg-sky-950/10" : ""
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {row.name || "Valued Contact"}
                        </span>
                        <p className="text-[11px] text-slate-500 font-mono">{row.email}</p>
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {row.source === "CSV_UPLOAD" ? (
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Users className="w-3.5 h-3.5 text-sky-500" />
                        )}
                        <span className="capitalize">{row.source === "CSV_UPLOAD" ? "CSV File" : "CRM Database"}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                        {row.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          row.openCount > 0 ? "text-sky-600 dark:text-sky-400 font-bold" : "text-slate-400"
                        }`}
                      >
                        {row.openCount}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          row.clickCount > 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"
                        }`}
                      >
                        {row.clickCount}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {isLinked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                          <UserCheck className="w-3 h-3" />
                          <span>CRM Lead Active</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePromote(row.id)}
                          disabled={promotingId === row.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-md text-[11px] font-bold transition-all shadow-xs disabled:opacity-50"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>{promotingId === row.id ? "Promoting..." : "Promote to CRM Lead"}</span>
                        </button>
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
