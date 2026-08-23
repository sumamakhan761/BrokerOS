"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { LiveMapCard } from "@/components/dashboard/LiveMapCard";
import { SalesExecTasks } from "./components/SalesExecTasks";
import { Calendar, MapPin, CheckCircle, MessageSquare, Trophy } from "lucide-react";

export default function SalesExecDashboard() {
  const { data: session, isPending } = authClient.useSession();
  const [dashData, setDashData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userName = (session?.user as any)?.name || "Sales Executive";
  const userId = (session?.user as any)?.id ?? null;

  useEffect(() => {
    if (isPending) return;
    async function load() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const [dashRes, lbRes] = await Promise.all([
          authClient.$fetch<any>("/api/dashboard/sales-executive", { baseURL: baseUrl }),
          authClient.$fetch<any>("/api/dashboard/sales-executive/leaderboard", { baseURL: baseUrl }),
        ]);
        if (dashRes.data) setDashData(dashRes.data);
        if (lbRes.data) setLeaderboard(lbRes.data);
        if (dashRes.error) throw new Error(dashRes.error.message || "Failed");
      } catch (e: any) {
        setError(e?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isPending]);

  const widgets = dashData?.widgets;
  const statItems = widgets ? [
    { label: "SV Scheduled", value: widgets.siteVisitsScheduled, icon: Calendar, accent: "#0369a1" },
    { label: "Today's SVs Done", value: widgets.todaySiteVisitsDone, icon: MapPin, accent: "#6d28d9" },
    { label: "SV Completed", value: widgets.siteVisitsCompleted, icon: CheckCircle, accent: "#7c3aed" },
    { label: "Negotiations", value: widgets.negotiations, icon: MessageSquare, accent: "#f59e0b" },
    { label: "Bookings", value: widgets.bookingsGenerated, icon: Trophy, accent: "#10b981" },
  ] : [];

  const lbEntries = (leaderboard?.leaderboard ?? []).map((e: any, i: number) => ({ ...e, rank: e.rank ?? i + 1 }));

  return (
    <DashboardPageWrapper
      loading={loading}
      error={error}
      userName={userName}
      subtitle="Here's your sales pipeline & daily tasks."
    >
      {/* Stat cards */}
      {dashData && <StatCards items={statItems} />}

      {/* Tasks + Leaderboard */}
      {dashData && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 16 }}>
          <SalesExecTasks dashData={dashData} />
          <Leaderboard
            title="Monthly Leaderboard"
            entries={lbEntries}
            currentUserId={leaderboard?.currentUserId}
            columns={[
              { key: "svCompleted", label: "SVs" },
              { key: "activeNegotiations", label: "Neg" },
              { key: "bookings", label: "Books" },
              { key: "score", label: "Score" },
            ]}
          />
        </div>
      )}

      {/* Live map */}
      <LiveMapCard
        userId={userId}
        title="My Live Location"
        subtitle="Updated automatically by mobile app"
      />
    </DashboardPageWrapper>
  );
}
