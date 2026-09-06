"use client";

// ============================================================================
// BrokerOS — WhatsApp Marketing Hub Overview Page (100% Real Live CRM Data)
// ============================================================================

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Users,
  Send,
  Zap,
  FileText,
  Settings,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";

interface OverviewData {
  connected: boolean;
  activeConversations: number;
  totalUnread: number;
  totalBroadcasts: number;
  totalContacts: number;
  aiActive: boolean;
  aiProvider: string | null;
  reliability: number;
  traffic7Days: Array<{ day: string; date: string; outbound: number; inbound: number }>;
  funnel: {
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    totalReplies: number;
    totalFailed: number;
    deliveredPct: number;
    readPct: number;
    repliedPct: number;
  };
  recentConversations: Array<{
    id: string;
    contactName: string;
    contactPhone: string;
    status: string;
    lastMessageText: string | null;
    lastMessageAt: string | null;
    unreadCount: number;
  }>;
  recentBroadcasts: Array<{
    id: string;
    name: string;
    templateName: string;
    status: string;
    totalRecipients: number;
    sentCount: number;
    deliveredCount: number;
    readCount: number;
    createdAt: string;
  }>;
}

export default function WhatsAppHubPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${baseUrl}/api/marketing/whatsapp/overview`);
        if (!res.ok) {
          throw new Error("Failed to fetch WhatsApp CRM overview metrics");
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err?.message || "Failed to load WhatsApp data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [baseUrl]);

  const totalTrafficMessages = (data?.traffic7Days || []).reduce(
    (acc, d) => acc + d.outbound + d.inbound,
    0,
  );

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      title="WhatsApp CRM & Broadcasts"
      subtitle="Omnichannel customer messaging, official Meta HSM broadcasts, AI sales concierge, and visual automations."
      headerRight={
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/marketing/whatsapp/inbox"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open WhatsApp Inbox</span>
          </Link>
          <Link
            href="/dashboard/marketing/whatsapp/broadcasts/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-2xs"
          >
            <Send className="w-4 h-4" />
            <span>New Broadcast</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Real KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-bg-surface border border-border-default rounded-2xl shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-text-tertiary">
              <span className="text-xs font-medium">Active Conversations</span>
              <MessageSquare className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {data?.activeConversations ?? 0}
            </div>
            <p className="text-[11px] text-text-tertiary">
              {(data?.totalUnread ?? 0) > 0 ? (
                <span className="text-emerald-500 font-semibold">{data?.totalUnread} unread messages</span>
              ) : (
                "All customer queries caught up"
              )}
            </p>
          </div>

          <div className="p-5 bg-bg-surface border border-border-default rounded-2xl shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-text-tertiary">
              <span className="text-xs font-medium">Broadcast Campaigns</span>
              <Send className="w-4 h-4 text-brand-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {data?.totalBroadcasts ?? 0}
            </div>
            <p className="text-[11px] text-text-tertiary">
              {data?.totalContacts ? `${data.totalContacts} contacts reachable` : "Meta Cloud API delivery"}
            </p>
          </div>

          <div className="p-5 bg-bg-surface border border-border-default rounded-2xl shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-text-tertiary">
              <span className="text-xs font-medium">AI Concierge</span>
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {data?.aiActive ? "Active" : "Disabled"}
            </div>
            <p className="text-[11px] text-text-tertiary">
              {data?.aiActive
                ? `${(data?.aiProvider || "LLM").toUpperCase()} auto-reply ready`
                : "Enable in WhatsApp Settings"}
            </p>
          </div>

          <div className="p-5 bg-bg-surface border border-border-default rounded-2xl shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-text-tertiary">
              <span className="text-xs font-medium">Delivery Reliability</span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-500">
              {data ? `${data.reliability}%` : "100%"}
            </div>
            <p className="text-[11px] text-text-tertiary">
              {data?.funnel.totalFailed ? `${data.funnel.totalFailed} failed dispatches` : "Zero delivery errors"}
            </p>
          </div>
        </div>

        {/* Real 7-Day Traffic Timeline & SLA Deliverability Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recharts Area Chart */}
          <div className="lg:col-span-2 p-6 bg-bg-surface border border-border-default rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-text-primary text-sm">7-Day WhatsApp Traffic</h3>
                <p className="text-xs text-text-tertiary">Actual inbound customer messages vs outbound messages</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-text-secondary">Outbound</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-text-secondary">Inbound</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data?.traffic7Days || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.1)" />
                  <XAxis dataKey="day" stroke="currentColor" className="text-[10px] text-text-tertiary" />
                  <YAxis stroke="currentColor" allowDecimals={false} className="text-[10px] text-text-tertiary" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-surface, #1e293b)",
                      borderColor: "var(--border-default, #334155)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="outbound"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOutbound)"
                  />
                  <Area
                    type="monotone"
                    dataKey="inbound"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorInbound)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {totalTrafficMessages === 0 && (
              <p className="text-[11px] text-center text-text-tertiary italic">
                No message traffic recorded in the past 7 days. Incoming chats and broadcast dispatches will chart here live.
              </p>
            )}
          </div>

          {/* Deliverability Funnel Card */}
          <div className="p-6 bg-bg-surface border border-border-default rounded-2xl shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-text-primary text-sm">Meta Deliverability Funnel</h3>
              <p className="text-xs text-text-tertiary">Computed from database message receipts</p>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-text-secondary">Sent to Meta Gateway</span>
                  <span className="text-text-primary font-mono font-semibold">
                    {data?.funnel.totalSent ?? 0} msgs (100%)
                  </span>
                </div>
                <div className="w-full h-2 bg-bg-subtle rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-text-secondary">Delivered to Handset</span>
                  <span className="text-emerald-500 font-mono font-semibold">
                    {data?.funnel.totalDelivered ?? 0} msgs ({data?.funnel.deliveredPct ?? 0}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-bg-subtle rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${data?.funnel.deliveredPct ?? 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-text-secondary">Read Receipt (Blue Ticks)</span>
                  <span className="text-purple-500 font-mono font-semibold">
                    {data?.funnel.totalRead ?? 0} msgs ({data?.funnel.readPct ?? 0}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-bg-subtle rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${data?.funnel.readPct ?? 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-text-secondary">Customer Inbound Replies</span>
                  <span className="text-amber-500 font-mono font-semibold">
                    {data?.funnel.totalReplies ?? 0} msgs ({data?.funnel.repliedPct ?? 0}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-bg-subtle rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${data?.funnel.repliedPct ?? 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Meta Cloud Status</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {data?.connected ? "Connected & Live" : "Awaiting Setup"}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Conversations & Recent Broadcasts Real Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Conversations */}
          <div className="p-6 bg-bg-surface border border-border-default rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <h3 className="font-semibold text-text-primary text-sm">Recent Active Chats</h3>
              </div>
              <Link
                href="/dashboard/marketing/whatsapp/inbox"
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                View all &rarr;
              </Link>
            </div>

            {(data?.recentConversations || []).length === 0 ? (
              <div className="text-center py-8 text-xs text-text-tertiary border border-dashed border-border-default rounded-xl">
                No active conversations yet. Messages sent or received will appear here.
              </div>
            ) : (
              <div className="divide-y divide-border-default/60">
                {(data?.recentConversations || []).map((c) => (
                  <Link
                    key={c.id}
                    href="/dashboard/marketing/whatsapp/inbox"
                    className="py-3 flex items-center justify-between hover:bg-bg-subtle/50 px-2 rounded-xl transition-colors group"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-text-primary truncate">
                          {c.contactName}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono">{c.contactPhone}</span>
                      </div>
                      <p className="text-xs text-text-secondary truncate mt-0.5">
                        {c.lastMessageText || "No messages yet"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {c.unreadCount > 0 ? (
                        <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[10px] font-bold">
                          {c.unreadCount}
                        </span>
                      ) : (
                        <span className="text-[10px] text-text-muted">
                          {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Broadcasts */}
          <div className="p-6 bg-bg-surface border border-border-default rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-brand-500" />
                <h3 className="font-semibold text-text-primary text-sm">Recent Broadcasts</h3>
              </div>
              <Link
                href="/dashboard/marketing/whatsapp/broadcasts"
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                View all &rarr;
              </Link>
            </div>

            {(data?.recentBroadcasts || []).length === 0 ? (
              <div className="text-center py-8 text-xs text-text-tertiary border border-dashed border-border-default rounded-xl">
                No broadcast campaigns launched yet. Click "New Broadcast" to get started.
              </div>
            ) : (
              <div className="divide-y divide-border-default/60">
                {(data?.recentBroadcasts || []).map((b) => (
                  <Link
                    key={b.id}
                    href={`/dashboard/marketing/whatsapp/broadcasts/${b.id}`}
                    className="py-3 flex items-center justify-between hover:bg-bg-subtle/50 px-2 rounded-xl transition-colors group"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-text-primary truncate">
                          {b.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-bg-subtle text-text-secondary border border-border-default">
                          {b.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted font-mono mt-0.5">
                        Template: {b.templateName}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-text-primary block">
                        {b.deliveredCount} / {b.totalRecipients}
                      </span>
                      <span className="text-[10px] text-text-muted">delivered</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Feature Hub Grid Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/marketing/whatsapp/inbox"
            className="p-5 bg-bg-surface border border-border-default rounded-2xl hover:border-emerald-500 hover:shadow-xs transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-text-primary text-sm">Unified Live Inbox</h4>
                <p className="text-xs text-text-secondary mt-0.5">
                  Real-time two-way WhatsApp chat, quick replies, and AI drafts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <span>Open Inbox</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            href="/dashboard/marketing/whatsapp/pipelines"
            className="p-5 bg-bg-surface border border-border-default rounded-2xl hover:border-blue-500 hover:shadow-xs transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-text-primary text-sm">Pipelines & Deals</h4>
                <p className="text-xs text-text-secondary mt-0.5">
                  Visual Kanban deal stages connected directly to WhatsApp leads
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
              <span>View Pipelines</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            href="/dashboard/marketing/whatsapp/broadcasts"
            className="p-5 bg-bg-surface border border-border-default rounded-2xl hover:border-brand-500 hover:shadow-xs transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-text-primary text-sm">Broadcast Campaigns</h4>
                <p className="text-xs text-text-secondary mt-0.5">
                  Send official Meta HSM broadcasts to filtered audiences
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-brand-600">
              <span>View Campaigns</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Secondary Hub Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/marketing/whatsapp/automations"
            className="flex items-center justify-between p-4 bg-bg-surface border border-border-default rounded-2xl hover:border-amber-500 hover:bg-bg-subtle transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <div>
                <span className="text-xs font-bold text-text-primary block">Automations</span>
                <span className="text-[10px] text-text-muted">Keyword triggers & tree logic</span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-text-tertiary" />
          </Link>

          <Link
            href="/dashboard/marketing/whatsapp/flows"
            className="flex items-center justify-between p-4 bg-bg-surface border border-border-default rounded-2xl hover:border-purple-500 hover:bg-bg-subtle transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <div>
                <span className="text-xs font-bold text-text-primary block">Flow Bots</span>
                <span className="text-[10px] text-text-muted">Interactive button & list bots</span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-text-tertiary" />
          </Link>

          <Link
            href="/dashboard/marketing/whatsapp/contacts"
            className="flex items-center justify-between p-4 bg-bg-surface border border-border-default rounded-2xl hover:border-brand-500 hover:bg-bg-subtle transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-brand-600" />
              <div>
                <span className="text-xs font-bold text-text-primary block">Contacts & Tags</span>
                <span className="text-[10px] text-text-muted">Lead directory & custom fields</span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-text-tertiary" />
          </Link>

          <Link
            href="/dashboard/marketing/whatsapp/settings"
            className="flex items-center justify-between p-4 bg-bg-surface border border-border-default rounded-2xl hover:border-slate-500 hover:bg-bg-subtle transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-xs font-bold text-text-primary block">Settings & AI</span>
                <span className="text-[10px] text-text-muted">WABA credentials & prompts</span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-text-tertiary" />
          </Link>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
