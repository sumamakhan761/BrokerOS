"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, Phone, Mail, MapPin, Calendar, ExternalLink, Search } from "lucide-react";
import type { MetaAcquiredLeadItem } from "../types";

interface MetaAcquiredLeadsTableProps {
  leads: MetaAcquiredLeadItem[];
  campaignName?: string;
}

export function MetaAcquiredLeadsTable({ leads, campaignName }: MetaAcquiredLeadsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = leads.filter((item) => {
    const l = item.lead;
    if (!l) return false;
    const term = searchTerm.toLowerCase();
    return (
      l.name.toLowerCase().includes(term) ||
      l.phone.toLowerCase().includes(term) ||
      (l.email && l.email.toLowerCase().includes(term)) ||
      (l.city && l.city.toLowerCase().includes(term))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "CONTACTED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
      case "INTERESTED":
      case "QUALIFIED":
        return "bg-purple-50 text-purple-700 border-purple-200/80";
      case "SITE_VISIT_SCHEDULED":
      case "SITE_VISIT_COMPLETED":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "BOOKING":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/80";
    }
  };

  const getTempBadge = (temp?: string) => {
    switch (temp) {
      case "HOT":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      case "WARM":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "COLD":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200/80";
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
          Form submissions from Meta Instant Lead Forms will appear here automatically via webhook or sync.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search leads by name, phone, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200/80 bg-slate-50/50 text-[var(--text-primary)] focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-500)]/20 focus:border-[var(--brand-500)] transition-all"
          />
        </div>
        <span className="text-xs font-bold text-[var(--text-tertiary)]">
          Showing {filtered.length} of {leads.length} leads
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[var(--text-tertiary)] font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Prospect Details</th>
              <th className="py-3.5 px-4">Contact</th>
              <th className="py-3.5 px-4">Location & Budget</th>
              <th className="py-3.5 px-4">CRM Status</th>
              <th className="py-3.5 px-4">Assigned Agent</th>
              <th className="py-3.5 px-4 text-right">Captured At</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[var(--text-primary)]">
            {filtered.map((item) => {
              const lead = item.lead;
              if (!lead) return null;

              return (
                <tr key={item.logId || item.leadgenId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-[var(--text-primary)] text-xs">
                        {lead.name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${getTempBadge(
                            lead.temperature
                          )}`}
                        >
                          {lead.temperature || "COLD"}
                        </span>
                        {item.formId && (
                          <span className="text-[10px] text-[var(--text-tertiary)] font-mono truncate max-w-[120px]">
                            Form: {item.formId}
                          </span>
                        )}
                      </div>
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

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getStatusBadge(
                        lead.status
                      )}`}
                    >
                      {lead.status.replace(/_/g, " ")}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-xs font-medium text-[var(--text-secondary)]">
                    {lead.assignedUser ? (
                      <span>{lead.assignedUser.name || lead.assignedUser.email || "Assigned"}</span>
                    ) : (
                      <span className="text-[var(--text-tertiary)] italic">Unassigned</span>
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
