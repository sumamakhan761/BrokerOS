"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export function SalesExecEmployeeLeadsView({
  employeeId,
}: {
  employeeId: string;
}) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeads() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const res = await authClient.$fetch<any[]>(
          `/api/leads/employee/${employeeId}`,
          { baseURL: baseUrl }
        );
        if (res.data) setLeads(res.data);
      } catch (e) {
        console.error("Failed to load leads", e);
      } finally {
        setLoading(false);
      }
    }
    loadLeads();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-[var(--text-muted)] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-600)]" />
        <span className="text-xs font-semibold">Loading assigned leads…</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-50/80 border-b border-slate-100">
            <tr>
              <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                Lead Name
              </th>
              <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                Score
              </th>
              <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                Next Follow-up
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-12 text-center text-[var(--text-muted)] font-semibold"
                >
                  No assigned leads found for this executive.
                </td>
              </tr>
            ) : (
              leads.map((lead: any) => (
                <tr
                  key={lead.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-5 py-3.5 font-bold text-[var(--text-primary)]">
                    {lead.firstName} {lead.lastName}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-50 text-[var(--brand-700)] border border-purple-200/60 text-[10px] font-extrabold uppercase tracking-wider">
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 font-extrabold tabular-nums">
                    {lead.score || 0}/100
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 font-semibold tabular-nums">
                    {lead.nextFollowUpDate
                      ? new Date(lead.nextFollowUpDate).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "None"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
