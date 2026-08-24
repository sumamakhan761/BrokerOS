"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { LiveMapCard } from "@/components/dashboard/LiveMapCard";
import { SourcingManagerTasks } from "./components/SourcingManagerTasks";
import {
  UserCheck,
  UserPlus,
  CalendarCheck,
  CalendarDays,
  Briefcase,
  Building2,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default function SourcingManagerDashboard({
  viewAsEmployeeId,
}: {
  viewAsEmployeeId?: string;
}) {
  const { data: session } = authClient.useSession();
  const userId = (session?.user as any)?.id ?? null;
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [data, setData] = useState<any>(null);

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
  }, [viewAsEmployeeId]);

  const {
    activeBrokers,
    newBrokers,
    todayMeetings,
    todayFollowUps,
    revenueStats,
  } = data ?? {};

  const topStatItems = data
    ? [
        {
          label: "Active Brokers (Deals)",
          value: activeBrokers ?? 0,
          icon: UserCheck,
          accent: "#10b981",
        },
        {
          label: "New Brokers",
          value: newBrokers ?? 0,
          icon: UserPlus,
          accent: "#3b82f6",
        },
        {
          label: "Today's Meetings",
          value: todayMeetings ?? 0,
          icon: CalendarCheck,
          accent: "#9333ea",
        },
        {
          label: "Today's Follow-ups",
          value: todayFollowUps ?? 0,
          icon: CalendarDays,
          accent: "#f59e0b",
        },
      ]
    : [];

  const revenueStatItems = revenueStats
    ? [
        {
          label: "Bookings Generated",
          value: revenueStats.bookingsGenerated ?? 0,
          icon: Briefcase,
          accent: "#9333ea",
        },
        {
          label: "Booking Revenue",
          value:
            "₹" +
            ((revenueStats.bookingRevenueGenerated || 0) / 100000).toFixed(1) +
            "L",
          icon: Building2,
          accent: "#10b981",
        },
        {
          label: "Broker Commission Paid",
          value:
            "₹" +
            ((revenueStats.brokerCommissionPaid || 0) / 100000).toFixed(1) +
            "L",
          icon: DollarSign,
          accent: "#3b82f6",
        },
        {
          label: "Revenue from Handovers",
          value:
            "₹" +
            ((revenueStats.brokerRevenueGenerated || 0) / 100000).toFixed(1) +
            "L",
          icon: TrendingUp,
          accent: "#7c3aed",
        },
      ]
    : [];

  const lbEntries = (data?.topPerformingBrokers ?? []).map(
    (b: any, i: number) => ({
      ...b,
      userId: b.id,
      name: b.name,
      rank: b.rank ?? i + 1,
    })
  );

  return (
    <DashboardPageWrapper
      loading={status === "loading"}
      error={
        status === "error"
          ? "Failed to load sourcing manager dashboard. Please try again."
          : null
      }
      title="Sourcing Manager Command Center"
      subtitle="Track channel partner network engagement, broker meetings, and generated deal revenue."
    >
      {/* Top stats */}
      {data && <StatCards items={topStatItems} cols={4} />}

      {/* Revenue stats */}
      {revenueStats && (
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider m-0">
            Channel Partner Sourcing Revenue & Payouts
          </h2>
          <StatCards items={revenueStatItems} cols={4} />
        </div>
      )}

      {/* Tasks + Broker Leaderboard */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <SourcingManagerTasks dashData={data} />
          </div>
          <div className="lg:col-span-3">
            <Leaderboard
              title="Top Performing Channel Partners (Brokers)"
              entries={lbEntries}
              columns={[
                { key: "bookingsGenerated", label: "Deals" },
                { key: "unitsSold", label: "Sold" },
                { key: "score", label: "Score" },
              ]}
            />
          </div>
        </div>
      )}

      {/* Live Map */}
      <LiveMapCard
        userId={userId}
        title="Live Sourcing Manager & Field GPS Radar"
        subtitle="Real-time broker visit locations synced from the field agent mobile application"
      />
    </DashboardPageWrapper>
  );
}
