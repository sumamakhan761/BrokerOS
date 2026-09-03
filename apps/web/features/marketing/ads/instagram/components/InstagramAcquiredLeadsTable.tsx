"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { InstagramAcquiredLeadItem } from "../types";

interface InstagramAcquiredLeadsTableProps {
  leads: InstagramAcquiredLeadItem[];
  campaignName?: string;
}

export function InstagramAcquiredLeadsTable({
  leads = [],
  campaignName = "Instagram Campaign",
}: InstagramAcquiredLeadsTableProps) {
  const formatCurrency = (val?: number) => {
    if (!val) return "—";
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  if (leads.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200/80 bg-white">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Users className="w-6 h-6" />
        </div>
        <h4 className="text-xs font-extrabold text-[var(--text-primary)]">
          No Inbound Leads Captured Yet
        </h4>
        <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-sm mx-auto">
          When buyers fill out your Instagram Lead Form, they will be automatically ingested into the CRM and displayed here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
            Acquired CRM Leads ({leads.length})
          </h3>
          <p className="text-xs font-medium text-[var(--text-tertiary)]">
            Real prospects captured via Instagram Instant Forms and synced with CRM.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-tertiary)]">
                <th className="py-3 px-4">Lead Contact</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Budget</th>
                <th className="py-3 px-4">Temperature</th>
                <th className="py-3 px-4">Assigned Agent</th>
                <th className="py-3 px-4">Captured At</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {leads.map((item) => {
                const lead = item.lead;
                return (
                  <tr
                    key={item.logId}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Contact */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-[var(--text-primary)]">
                          {lead.name}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--text-tertiary)] mt-0.5 font-mono">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            {lead.phone}
                          </span>
                          {lead.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-pink-600" />
                              {lead.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 font-medium text-[var(--text-secondary)]">
                      {lead.city || "Mumbai"}
                    </td>

                    {/* Budget */}
                    <td className="py-3 px-4 font-bold text-[var(--text-primary)]">
                      {formatCurrency(lead.budget)}
                    </td>

                    {/* Temperature */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                        <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />
                        <span>HOT LEAD</span>
                      </span>
                    </td>

                    {/* Assigned Agent */}
                    <td className="py-3 px-4 text-[var(--text-secondary)]">
                      {lead.assignedUser?.name || "Auto-Assign (Round Robin)"}
                    </td>

                    {/* Captured At */}
                    <td className="py-3 px-4 text-[var(--text-tertiary)] font-mono text-[11px]">
                      {new Date(item.capturedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <a
                        href={`tel:${lead.phone}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-pink-600 hover:text-pink-700 hover:underline"
                      >
                        <span>Call Lead</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
