"use client";

import React from "react";
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  Send,
  Sparkles,
  MousePointer,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CAMPAIGN_STATUS_CONFIG } from "@brokeros/constants";

export interface UnifiedBroadcastItem {
  id: string;
  type: "EMAIL" | "SMS";
  title: string;
  previewText: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount?: number;
  clickedCount: number;
  createdAt: string;
  projectName?: string;
  providerName?: string;
  detailUrl: string;
}

export interface UnifiedBroadcastsTableProps {
  broadcasts: UnifiedBroadcastItem[];
  isLoading?: boolean;
}

export function UnifiedBroadcastsTable({
  broadcasts,
  isLoading,
}: UnifiedBroadcastsTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[var(--text-secondary)]">
          <thead className="bg-slate-50/90 text-[11px] font-extrabold uppercase text-[var(--text-tertiary)] tracking-wider border-b border-slate-200/80">
            <tr>
              <th className="py-3.5 px-4">Channel & Broadcast</th>
              <th className="py-3.5 px-4">Project</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Performance</th>
              <th className="py-3.5 px-4">Created Date</th>
              <th className="py-3.5 px-4 text-right">Analytics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold">
                    <Sparkles className="w-4 h-4 animate-spin text-[var(--brand-600)]" />
                    <span>Loading marketing broadcasts...</span>
                  </div>
                </td>
              </tr>
            ) : broadcasts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-400">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-[var(--brand-600)] mx-auto mb-2.5">
                    <Send className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">No marketing broadcasts found</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Launch your first Email or SMS broadcast to start reaching leads.
                  </p>
                </td>
              </tr>
            ) : (
              broadcasts.map((item) => {
                const isEmail = item.type === "EMAIL";
                const statusMeta =
                  CAMPAIGN_STATUS_CONFIG[item.status as keyof typeof CAMPAIGN_STATUS_CONFIG] ||
                  CAMPAIGN_STATUS_CONFIG.DRAFT;

                return (
                  <tr
                    key={`${item.type}-${item.id}`}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Channel & Broadcast Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isEmail
                              ? "bg-purple-50 text-purple-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {isEmail ? (
                            <Mail className="w-4 h-4" />
                          ) : (
                            <MessageSquare className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0 max-w-sm">
                          <div className="flex items-center gap-2">
                            <Link
                              href={item.detailUrl}
                              className="font-extrabold text-[var(--text-primary)] hover:text-[var(--brand-600)] transition-colors truncate"
                            >
                              {item.title}
                            </Link>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                isEmail
                                  ? "bg-purple-100/70 text-purple-700"
                                  : "bg-amber-100/70 text-amber-800"
                              }`}
                            >
                              {item.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Project */}
                    <td className="py-3.5 px-4 font-medium text-[var(--text-secondary)]">
                      {item.projectName || "General Audience"}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${statusMeta.bg}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {statusMeta.label}
                      </span>
                    </td>

                    {/* Performance */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3 text-xs">
                        <div>
                          <span className="font-extrabold text-[var(--text-primary)]">
                            {item.deliveredCount.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-[var(--text-tertiary)] ml-1">
                            sent
                          </span>
                        </div>
                        {isEmail && typeof item.openedCount === "number" && (
                          <div className="text-purple-600 font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>{item.openedCount} opens</span>
                          </div>
                        )}
                        <div className="text-emerald-600 font-semibold flex items-center gap-1">
                          <MousePointer className="w-3 h-3" />
                          <span>{item.clickedCount} clicks</span>
                        </div>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-xs font-medium text-[var(--text-tertiary)]">
                      {new Date(item.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Action Link */}
                    <td className="py-3.5 px-4 text-right">
                      <Link href={item.detailUrl}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs font-bold gap-1 text-[var(--brand-600)] hover:text-[var(--brand-700)]"
                        >
                          <span>View Funnel</span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
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
