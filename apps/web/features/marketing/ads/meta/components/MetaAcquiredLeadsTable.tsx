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
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400";
      case "CONTACTED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400";
      case "INTERESTED":
      case "QUALIFIED":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400";
      case "SITE_VISIT_SCHEDULED":
      case "SITE_VISIT_COMPLETED":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400";
      case "BOOKING":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400";
      default:
        return "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300";
    }
  };

  const getTempBadge = (temp?: string) => {
    switch (temp) {
      case "HOT":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400";
      case "WARM":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400";
      case "COLD":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400";
      default:
        return "bg-zinc-50 text-zinc-600 border-zinc-200";
    }
  };

  if (!leads || leads.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 mb-2">
          <Users className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No Leads Captured Yet</p>
        <p className="text-[11px] text-zinc-400 mt-0.5">
          Form submissions from Meta Instant Lead Forms will appear here automatically via webhook or sync.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
      <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search leads by name, phone, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
          />
        </div>
        <span className="text-xs text-zinc-400">
          Showing {filtered.length} of {leads.length} leads
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50/80 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 font-medium">
            <tr>
              <th className="py-2.5 px-4">Prospect Details</th>
              <th className="py-2.5 px-4">Contact</th>
              <th className="py-2.5 px-4">Location & Budget</th>
              <th className="py-2.5 px-4">CRM Status</th>
              <th className="py-2.5 px-4">Assigned Agent</th>
              <th className="py-2.5 px-4">Captured At</th>
              <th className="py-2.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
            {filtered.map((item) => {
              const lead = item.lead!;
              const formattedDate = new Date(item.capturedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <tr key={item.logId} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-center gap-2">
                      <span>{lead.name}</span>
                      {lead.temperature && (
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${getTempBadge(lead.temperature)}`}>
                          {lead.temperature}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-col text-[11px]">
                      <span className="font-mono text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5 text-zinc-400" />
                        {lead.phone}
                      </span>
                      {lead.email && (
                        <span className="text-zinc-400 truncate flex items-center gap-1">
                          <Mail className="w-2.5 h-2.5 text-zinc-400" />
                          {lead.email}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-[11px]">
                      {lead.city && (
                        <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
                          <MapPin className="w-2.5 h-2.5 text-zinc-400" />
                          {lead.city}
                        </div>
                      )}
                      {lead.budget ? (
                        <div className="text-zinc-900 dark:text-zinc-100 font-medium">
                          ₹{(lead.budget / 100000).toFixed(1)} Lakhs
                        </div>
                      ) : null}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getStatusBadge(lead.status)}`}>
                      {lead.status.replace(/_/g, " ")}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-[11px] text-zinc-600 dark:text-zinc-300">
                    {lead.assignedUser?.name || <span className="text-zinc-400">Unassigned</span>}
                  </td>

                  <td className="py-3 px-4 text-[11px] text-zinc-400 font-mono">
                    {formattedDate}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/dashboard/leads/${lead.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Lead Card
                      <ExternalLink className="w-2.5 h-2.5" />
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
