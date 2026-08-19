"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { toast } from 'sonner';
import { Announcements } from "@/components/dashboard/Announcements";
import { StatCards } from "@/components/dashboard/StatCards";
import { PipelineBar } from "@/components/dashboard/PipelineBar";
import { CircleProgress } from "@/components/dashboard/CircleProgress";
import { BacklogPanel } from "@/components/dashboard/BacklogPanel";
import { FollowUpList } from "@/components/dashboard/FollowUpList";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import {
  Sparkles, ClipboardList, AlertCircle, MapPin, Trophy,
} from "lucide-react";

const PIPELINE_STAGES = [
  { key: "new", label: "New", color: "#8b5cf6" },
  { key: "contacted", label: "Contacted", color: "#6366f1" },
  { key: "siteVisit", label: "Site Visit", color: "#3b82f6" },
  { key: "negotiation", label: "Negotiation", color: "#0ea5e9" },
  { key: "booked", label: "Booked", color: "#10b981" },
];

export default function PreSalesDashboard() {
  const { data: session } = authClient.useSession();
  const [dashData, setDashData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userName = (session?.user as any)?.name || "Agent";

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const [dashRes, lbRes, annRes] = await Promise.all([
          authClient.$fetch<any>("/api/dashboard/pre-sales", { baseURL: baseUrl }),
          authClient.$fetch<any>("/api/dashboard/pre-sales/leaderboard", { baseURL: baseUrl }),
          authClient.$fetch<any[]>("/api/dashboard/pre-sales/my-announcements", { baseURL: baseUrl }),
        ]);
        if (dashRes.data) setDashData(dashRes.data);
        if (lbRes.data) setLeaderboard(lbRes.data);
        if (annRes.data) setAnnouncements(annRes.data);
        if (dashRes.error) throw new Error(dashRes.error.message || "Failed to load dashboard");
      } catch (e: any) {
        setError(e?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const confirmFollowUp = async (id: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await authClient.$fetch<any>(`/api/dashboard/pre-sales/follow-ups/${id}/confirm`, {
        method: "POST", baseURL: baseUrl,
      });
      if (res.data?.success) window.location.reload();
      else toast.error(res.data?.message || res.error?.message || "Failed");
    } catch (e: any) { toast.error(e?.message || "Failed"); }
  };

  const widgets = dashData?.widgets;
  const statItems = widgets ? [
    { label: "New Leads", value: widgets.newLeads, icon: Sparkles, accent: "#7c3aed" },
    { label: "Today's Follow-ups", value: widgets.todayFollowUps, icon: ClipboardList, accent: "#10b981" },
    { label: "Missed Follow-ups", value: widgets.missedFollowUps, icon: AlertCircle, accent: "#f59e0b" },
    { label: "Site Visits", value: widgets.siteVisitsScheduled, icon: MapPin, accent: "#7c3aed" },
    { label: "Bookings", value: widgets.bookingsGenerated, icon: Trophy, accent: "#ec4899" },
  ] : [];

  const lbEntries = (leaderboard?.leaderboard ?? []).map((e: any, i: number) => ({ ...e, rank: e.rank ?? i + 1 }));

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      userName={userName}
      subtitle="Here's what's happening with your pipeline this month."
    >
      {/* Announcements */}
      <Announcements announcements={announcements} />

      {/* Stat Cards */}
      {dashData && <StatCards items={statItems} />}

      {/* Middle row: Pipeline + Daily Tasks + Backlogs */}
      {dashData && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <PipelineBar
            title="Pipeline Stages"
            stages={PIPELINE_STAGES}
            data={dashData.pipeline ?? {}}
          />
          {/* Daily Tasks — two circle progresses */}
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
              marginBottom: 20,
            }}>
              Daily Tasks
            </div>
            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
              <CircleProgress
                done={dashData.dailyTasks?.coldCall?.done ?? 0}
                target={dashData.dailyTasks?.coldCall?.target ?? 1}
                label="Cold Calls"
                color="var(--brand-600)"
              />
              <CircleProgress
                done={dashData.dailyTasks?.followUp?.done ?? 0}
                target={dashData.dailyTasks?.followUp?.target || 1}
                label="Follow-ups"
                color="#10b981"
              />
            </div>
          </div>
          <BacklogPanel
            coldCallBacklogCount={dashData.backlogs?.coldCallBacklogCount ?? 0}
            missedFollowUps={dashData.backlogs?.missedFollowUps ?? []}
          />
        </div>
      )}

      {/* Bottom row: Follow-ups + Leaderboard */}
      {dashData && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 16 }}>
          <FollowUpList
            items={dashData.todayFollowUpList ?? []}
            onConfirm={confirmFollowUp}
            viewAllHref={`/dashboard/pre-sales/lead-management?followUpDate=${new Date().toLocaleDateString("en-CA")}`}
          />
          <Leaderboard
            title="Monthly Leaderboard"
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
      )}
    </DashboardPageWrapper>
  );
}
