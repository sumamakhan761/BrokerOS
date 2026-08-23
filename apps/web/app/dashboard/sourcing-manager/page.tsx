"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { LiveMapCard } from "@/components/dashboard/LiveMapCard";
import { SourcingManagerTasks } from "./components/SourcingManagerTasks";
import {
  UserCheck, UserPlus, CalendarCheck, CalendarDays,
  Briefcase, Building2, DollarSign, TrendingUp,
} from "lucide-react";

export default function SourcingManagerDashboard({ viewAsEmployeeId }: { viewAsEmployeeId?: string }) {
  const { data: session } = authClient.useSession();
  const userId = (session?.user as any)?.id ?? null;
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [data, setData]     = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const endpoint = viewAsEmployeeId
          ? `/api/dashboard/channel-partner/employees/${viewAsEmployeeId}/sourcing/dashboard`
          : "/api/dashboard/sourcing-manager";
        const res = await authClient.$fetch(endpoint, { baseURL: baseUrl });
        if (res.error) throw new Error(res.error.message || "Failed");
        setData(res.data);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    }
    fetchData();
  }, []);

  const { activeBrokers, newBrokers, todayMeetings, todayFollowUps, revenueStats } = data ?? {};

  const topStatItems = data ? [
    { label: "Active Brokers (Deals)", value: activeBrokers ?? 0,  icon: UserCheck,    accent: "#15803d" },
    { label: "New Brokers",            value: newBrokers ?? 0,     icon: UserPlus,     accent: "#0369a1" },
    { label: "Today's Meetings",       value: todayMeetings ?? 0,  icon: CalendarCheck,accent: "#7c3aed" },
    { label: "Today's Follow-ups",     value: todayFollowUps ?? 0, icon: CalendarDays, accent: "#b45309" },
  ] : [];

  const revenueStatItems = revenueStats ? [
    { label: "Bookings Generated",    value: revenueStats.bookingsGenerated ?? 0, icon: Briefcase,   accent: "#7c3aed" },
    { label: "Booking Revenue",       value: "₹" + ((revenueStats.bookingRevenueGenerated || 0) / 100000).toFixed(1) + "L", icon: Building2, accent: "#15803d" },
    { label: "Broker Commission Paid",value: "₹" + ((revenueStats.brokerCommissionPaid || 0) / 100000).toFixed(1) + "L",   icon: DollarSign,accent: "#0369a1" },
    { label: "Revenue from Handovers",value: "₹" + ((revenueStats.brokerRevenueGenerated || 0) / 100000).toFixed(1) + "L", icon: TrendingUp, accent: "#6d28d9" },
  ] : [];

  const lbEntries = (data?.topPerformingBrokers ?? []).map((b: any, i: number) => ({
    ...b,
    userId: b.id,
    name: b.name,
    rank: b.rank ?? i + 1,
  }));

  return (
    <DashboardPageWrapper
      loading={status === "loading"}
      error={status === "error" ? "Failed to load dashboard. Please try again." : null}
      title="Sourcing Overview"
      subtitle="Track your brokers' performance, meetings, and generated revenue."
    >
      {/* Top stats */}
      {data && <StatCards items={topStatItems} cols={4} />}

      {/* Revenue stats */}
      {revenueStats && (
        <>
          <div style={{
            fontSize: "var(--text-lg)",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}>
            Revenue & Performance
          </div>
          <StatCards items={revenueStatItems} cols={4} />
        </>
      )}

      {/* Tasks + Broker Leaderboard */}
      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 16 }}>
          <SourcingManagerTasks dashData={data} />
          <Leaderboard
            title="Top Performing Brokers"
            entries={lbEntries}
            columns={[
              { key: "bookingsGenerated", label: "Books" },
              { key: "unitsSold",         label: "Sold"  },
              { key: "score",             label: "Score" },
            ]}
          />
        </div>
      )}

      {/* Live Map */}
      <LiveMapCard
        userId={userId}
        title="Live Broker Tracking"
        subtitle="Syncs from mobile app automatically"
      />
    </DashboardPageWrapper>
  );
}
