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
  Users, TrendingUp, XCircle, Clock, AlertCircle, MapPin, Percent,
} from "lucide-react";

const PIPELINE_STAGES = [
  { key: "new",         label: "New",          color: "#8b5cf6" },
  { key: "contacted",   label: "Contacted",    color: "#6366f1" },
  { key: "siteVisit",   label: "Site Visit",   color: "#3b82f6" },
  { key: "negotiation", label: "Negotiation",  color: "#0ea5e9" },
  { key: "booked",      label: "Booked",       color: "#10b981" },
];

export default function PreSalesManagerDashboard() {
  const { data: session } = authClient.useSession();
  const [dashData, setDashData]       = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const userName = (session?.user as any)?.name || "Manager";

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const [dashRes, lbRes] = await Promise.all([
          fetch(baseUrl + "/api/dashboard/pre-sales-manager").then(r => r.json()),
          fetch(baseUrl + "/api/dashboard/pre-sales-manager/leaderboard").then(r => r.json()),
        ]);
        if (dashRes.widgets) setDashData(dashRes);
        if (Array.isArray(lbRes)) {
          setLeaderboard({
            leaderboard: lbRes.map((r: any, i: number) => ({ ...r, rank: i + 1 })),
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
  const statItems = w ? [
    { label: "Total Leads",        value: w.totalLeads,          icon: Users,      accent: "#6b7280" },
    { label: "New Leads",          value: w.newLeads,            icon: TrendingUp, accent: "#7c3aed" },
    { label: "Active Leads",       value: w.activeLeads,         icon: Users,      accent: "#15803d" },
    { label: "Lost Leads",         value: w.lostLeads,           icon: XCircle,    accent: "#dc2626" },
    { label: "Today's Follow-ups", value: w.todayFollowUps,      icon: Clock,      accent: "#d97706" },
    { label: "Missed Follow-ups",  value: w.missedFollowUps,     icon: AlertCircle,accent: "#be123c" },
    { label: "Site Visits",        value: w.siteVisitsScheduled, icon: MapPin,     accent: "#7c3aed" },
    { label: "Conversion Rate",    value: (w.conversionRate ?? 0) + "%", icon: Percent, accent: "#0284c7" },
  ] : [];

  const lbEntries = (leaderboard?.leaderboard ?? []).map((e: any, i: number) => ({ ...e, userId: e.userId ?? e.id, rank: e.rank ?? i + 1 }));

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      userName={userName}
      subtitle="Here's the performance overview for your entire team."
    >
      {/* Stats */}
      {dashData && <StatCards items={statItems} />}

      {/* Pipeline + Team Backlogs */}
      {dashData && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <PipelineBar
            title="Team Pipeline Distribution"
            stages={PIPELINE_STAGES}
            data={dashData.pipeline ?? {}}
          />
          {/* Team backlogs — per-agent list (unique to PSM) */}
          <TeamBacklogsCard backlogs={dashData.backlogs ?? []} />
        </div>
      )}

      {/* Follow-ups + Leaderboard */}
      {dashData && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 16 }}>
          <FollowUpList
            items={dashData.todayFollowUpList ?? []}
            title="Team Today's Follow-ups"
          />
          <Leaderboard
            title="Team Monthly Leaderboard"
            entries={lbEntries}
            currentUserId={leaderboard?.currentUserId}
            columns={[
              { key: "coldCalls",  label: "Calls" },
              { key: "followUps",  label: "F-ups" },
              { key: "siteVisits", label: "Visits" },
              { key: "score",      label: "Score" },
            ]}
          />
        </div>
      )}
    </DashboardPageWrapper>
  );
}

/* Per-agent backlog table — PSM specific (not in BacklogPanel) */
function TeamBacklogsCard({ backlogs }: { backlogs: any[] }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-xl)",
      padding: "24px",
      boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-primary)",
        letterSpacing: "-0.01em",
        marginBottom: 16,
      }}>
        Team Backlogs
      </div>
      {backlogs.length === 0 ? (
        <div style={{
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "var(--text-sm)",
          padding: "24px 0",
        }}>
          No backlogs found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {backlogs.map((agent: any) => (
            <div key={agent.id} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              background: "var(--bg-subtle)",
              borderRadius: "var(--radius-md)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={agent.name} size={30} />
                <span style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}>
                  {agent.name}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{
                  background: "var(--danger-bg)",
                  color: "var(--danger-fg)",
                  padding: "3px 10px",
                  borderRadius: "var(--radius-full)",
                  fontSize: 11,
                  fontWeight: 700,
                  border: "1px solid #fecaca",
                }}>
                  {agent.missedFollowUps} Missed F-ups
                </span>
                <span style={{
                  background: "var(--warning-bg)",
                  color: "var(--warning-fg)",
                  padding: "3px 10px",
                  borderRadius: "var(--radius-full)",
                  fontSize: 11,
                  fontWeight: 700,
                  border: "1px solid #fde68a",
                }}>
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
