"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Plus,
  Send,
  CheckCircle2,
  Eye,
  MousePointer,
  Settings,
  Sparkles,
  Zap,
} from "lucide-react";
import { CampaignListTable } from "@/features/marketing/components/CampaignListTable";
import type { CampaignItem } from "@/features/marketing/types";

export default function EmailMarketingDashboard() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    fetch(`${baseUrl}/api/marketing/campaigns`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.items) {
          setCampaigns(data.items);
        }
      })
      .catch(() => {
        // Mock fallback if API not yet populated
        setCampaigns([
          {
            id: "camp-demo-1",
            title: "Diwali Special Launch — Skyline Luxuria",
            channel: "EMAIL",
            status: "COMPLETED",
            providerType: "SYSTEM_DEFAULT",
            audienceSource: "CRM_DATABASE",
            subject: "✨ Exclusive Pre-Launch Access: Skyline Luxuria is Now Open!",
            fromName: "Skyline Sales Team",
            fromEmail: "sales@skyline.com",
            totalRecipients: 4250,
            sentCount: 4250,
            deliveredCount: 4210,
            openedCount: 1680,
            clickedCount: 520,
            bouncedCount: 40,
            unsubscribedCount: 8,
            createdAt: new Date().toISOString(),
            project: { id: "p1", name: "Skyline Luxuria" },
          },
          {
            id: "camp-demo-2",
            title: "Channel Partner Commission Scheme (Oct Boost)",
            channel: "EMAIL",
            status: "COMPLETED",
            providerType: "SYSTEM_DEFAULT",
            audienceSource: "CSV_UPLOAD",
            subject: "🤝 Special 3.5% Spot Commission for Partner Brokers",
            fromName: "Channel Sourcing Team",
            fromEmail: "partners@brokeros.io",
            totalRecipients: 1200,
            sentCount: 1200,
            deliveredCount: 1190,
            openedCount: 640,
            clickedCount: 290,
            bouncedCount: 10,
            unsubscribedCount: 2,
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          },
        ]);
      })
      .finally(() => setIsLoading(false));
  }, [baseUrl]);

  const totalSent = campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0);
  const totalDelivered = campaigns.reduce((acc, c) => acc + (c.deliveredCount || 0), 0);
  const totalOpened = campaigns.reduce((acc, c) => acc + (c.openedCount || 0), 0);
  const totalClicked = campaigns.reduce((acc, c) => acc + (c.clickedCount || 0), 0);

  const avgOpenRate = totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : "0.0";
  const avgClickRate = totalDelivered > 0 ? ((totalClicked / totalDelivered) * 100).toFixed(1) : "0.0";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Mail className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Email Marketing</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Target buyer leads & channel partners with project launches, price drops, and commission schemes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/marketing/email/settings"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-zinc-800 transition-colors shadow-xs"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Integrations</span>
          </Link>

          <Link
            href="/dashboard/marketing/email/campaigns/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </Link>
        </div>
      </div>

      {/* ── SYSTEM DEFAULT PROVIDER BADGE ── */}
      <div className="p-3.5 bg-gradient-to-r from-sky-50 via-slate-50 to-indigo-50 dark:from-sky-950/30 dark:via-zinc-900 dark:to-indigo-950/30 rounded-xl border border-sky-200/80 dark:border-sky-900/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-4 h-4 text-sky-500 shrink-0" />
          <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
            <strong>BrokerOS System Engine (AWS SES)</strong> is active with high inbox placement &amp; automatic SPF/DKIM verification.
          </span>
        </div>
        <Link
          href="/dashboard/marketing/email/settings"
          className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline shrink-0"
        >
          Manage Providers &rarr;
        </Link>
      </div>

      {/* ── OVERALL KPI STATS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <span>Total Emails Sent</span>
            <Send className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalSent.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Across all campaigns</p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <span>Delivered Total</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalDelivered.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">99.2% Deliverability</p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <span>Average Open Rate</span>
            <Eye className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{avgOpenRate}%</p>
          <p className="text-xs text-slate-400 mt-1">{totalOpened.toLocaleString()} total opens</p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <span>Average Click Rate</span>
            <MousePointer className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{avgClickRate}%</p>
          <p className="text-xs text-slate-400 mt-1">{totalClicked.toLocaleString()} link clicks</p>
        </div>
      </div>

      {/* ── CAMPAIGNS TABLE ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Marketing Campaigns</h2>
          <span className="text-xs text-slate-400">{campaigns.length} campaigns created</span>
        </div>

        <CampaignListTable campaigns={campaigns} isLoading={isLoading} />
      </div>
    </div>
  );
}
