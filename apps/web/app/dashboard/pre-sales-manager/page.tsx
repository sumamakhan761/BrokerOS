"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { PipelineBar } from "@/components/dashboard/PipelineBar";
import { FollowUpList } from "@/components/dashboard/FollowUpList";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { Avatar } from "@/components/dashboard/Avatar";
import {
  Users,
  TrendingUp,
  XCircle,
  Clock,
  AlertCircle,
  MapPin,
  Percent,
} from "lucide-react";

const PIPELINE_STAGES = [
  { key: "new", label: "New", color: "#8b5cf6" },
  { key: "contacted", label: "Contacted", color: "#6366f1" },
  { key: "siteVisit", label: "Site Visit", color: "#3b82f6" },
  { key: "negotiation", label: "Negotiation", color: "#0ea5e9" },
  { key: "booked", label: "Booked", color: "#10b981" },
];

export default function PreSalesManagerDashboard() {
  const { data: session } = authClient.useSession();
  const [dashData, setDashData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userName = (session?.user as any)?.name || "Manager";

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const [dashRes, lbRes] = await Promise.all([
          fetch(baseUrl + "/api/dashboard/pre-sales-manager").then((r) =>
            r.json()
          ),
          fetch(baseUrl + "/api/dashboard/pre-sales-manager/leaderboard").then(
            (r) => r.json()
          ),
        ]);
        if (dashRes.widgets) setDashData(dashRes);
        if (Array.isArray(lbRes)) {
          setLeaderboard({
            leaderboard: lbRes.map((r: any, i: number) => ({
              ...r,
              rank: i + 1,
            })),
            currentUserId: session?.user?.id ?? "",
          });
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session?.user?.id]);

  const w = dashData?.widgets;
  const statItems = w
    ? [
        {
          label: "Total Leads",
          value: w.totalLeads,
          icon: Users,
          accent: "#6b7280",
        },
        {
          label: "New Leads",
          value: w.newLeads,
          icon: TrendingUp,
          accent: "#9333ea",
        },
        {
          label: "Active Leads",
          value: w.activeLeads,
          icon: Users,
          accent: "#10b981",
        },
        {
          label: "Lost Leads",
          value: w.lostLeads,
          icon: XCircle,
          accent: "#e11d48",
        },
        {
          label: "Today's Follow-ups",
          value: w.todayFollowUps,
          icon: Clock,
          accent: "#d97706",
        },
        {
          label: "Missed Follow-ups",
          value: w.missedFollowUps,
          icon: AlertCircle,
          accent: "#be123c",
        },
        {
          label: "Site Visits",
          value: w.siteVisitsScheduled,
          icon: MapPin,
          accent: "#7c3aed",
        },
        {
          label: "Conversion Rate",
          value: (w.conversionRate ?? 0) + "%",
          icon: Percent,
          accent: "#0284c7",
        },
      ]
    : [];

  const lbEntries = (leaderboard?.leaderboard ?? []).map(
    (e: any, i: number) => ({
      ...e,
      userId: e.userId ?? e.id,
      rank: e.rank ?? i + 1,
    })
  );

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      userName={userName}
      subtitle="Performance overview & operational health across your pre-sales team."
    >
      {/* Stats */}
      {dashData && <StatCards items={statItems} />}

      {/* Pipeline + Team Backlogs */}
      {dashData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PipelineBar
            title="Team Pipeline Distribution"
            stages={PIPELINE_STAGES}
            data={dashData.pipeline ?? {}}
          />
          <TeamBacklogsCard backlogs={dashData.backlogs ?? []} />
        </div>
      )}

      {/* Follow-ups + Leaderboard */}
      {dashData && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <FollowUpList
              items={dashData.todayFollowUpList ?? []}
              title="Team Today's Follow-ups"
            />
          </div>
          <div className="lg:col-span-3">
            <Leaderboard
              title="Team Monthly Leaderboard"
              entries={lbEntries}
              currentUserId={leaderboard?.currentUserId}
              columns={[
                { key: "coldCalls", label: "Calls" },
                { key: "followUps", label: "F-ups" },
                { key: "siteVisits", label: "Visits" },
                { key: "score", label: "Score" },
              ]}
            />
          </div>
        </div>
      )}
    </DashboardPageWrapper>
  );
}

function TeamBacklogsCard({ backlogs }: { backlogs: any[] }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs">
      <div className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">
        Team Backlogs & Untouched
      </div>
      {backlogs.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] text-xs font-medium py-8">
          No agent backlogs found. All queues clear!
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {backlogs.map((agent: any) => (
            <div
              key={agent.id}
              className="flex items-center justify-between p-3 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar name={agent.name} size={32} />
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {agent.name}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tabular-nums">
                  {agent.missedFollowUps} Missed F-ups
                </span>
                <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tabular-nums">
                  {agent.untouchedLeads} Untouched
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
