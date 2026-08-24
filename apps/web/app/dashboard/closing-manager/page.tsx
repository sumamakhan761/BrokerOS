"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { ClosingManagerTasks } from "./components/ClosingManagerTasks";
import {
  CheckCircle2,
  Home,
  Users,
  Building2,
  TrendingUp,
  DollarSign,
} from "lucide-react";

export default function ClosingManagerDashboard({
  viewAsEmployeeId,
}: {
  viewAsEmployeeId?: string;
}) {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const endpoint = viewAsEmployeeId
          ? `/api/dashboard/channel-partner/employees/${viewAsEmployeeId}/closing/dashboard`
          : "/api/dashboard/closing-manager";
        const res = await authClient.$fetch(endpoint, { baseURL: baseUrl });
        if (res.error) throw new Error(res.error.message || "Failed");
        setData(res?.data);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    }
    fetchData();
  }, [viewAsEmployeeId]);

  const { widgets } = data ?? {};

  const generalStatItems = widgets
    ? [
        {
          label: "Total Bookings",
          value: widgets.totalBookings ?? 0,
          icon: CheckCircle2,
          accent: "#10b981",
        },
        {
          label: "Total Units Sold",
          value: widgets.totalUnitsSold ?? 0,
          icon: Home,
          accent: "#3b82f6",
        },
        {
          label: "Brokers (Deals Closed)",
          value: widgets.totalBrokers ?? 0,
          icon: Users,
          accent: "#9333ea",
        },
      ]
    : [];

  const revenueStatItems = widgets
    ? [
        {
          label: "Total Booking Revenue",
          value:
            "₹" +
            ((widgets.totalBookingRevenue || 0) / 100000).toFixed(1) +
            "L",
          icon: Building2,
          accent: "#10b981",
          sub: "Tokens at initial booking",
        },
        {
          label: "Total Revenue Generated",
          value:
            "₹" +
            ((widgets.totalRevenueGenerated || 0) / 100000).toFixed(1) +
            "L",
          icon: TrendingUp,
          accent: "#9333ea",
          sub: "Agreed value on closed deals",
        },
        {
          label: "Total Broker Commission",
          value:
            "₹" +
            ((widgets.totalBrokerCommission || 0) / 100000).toFixed(1) +
            "L",
          icon: DollarSign,
          accent: "#f59e0b",
          sub: "Brokerage for CP network",
        },
      ]
    : [];

  return (
    <DashboardPageWrapper
      loading={status === "loading"}
      error={
        status === "error"
          ? "Failed to load closing manager dashboard. Please try again."
          : null
      }
      title="Closing Manager Command Center"
      subtitle="Supervise transaction closures, bank loan coordination & handover milestones for CP deals."
    >
      {/* General stats */}
      {widgets && <StatCards items={generalStatItems} cols={3} />}

      {/* Revenue section header */}
      {widgets && (
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider m-0">
            Channel Partner Closing Revenue & Performance
          </h2>
          <StatCards items={revenueStatItems} cols={3} />
        </div>
      )}

      {/* Tabbed task lists */}
      {data && <ClosingManagerTasks dashData={data} />}
    </DashboardPageWrapper>
  );
}
