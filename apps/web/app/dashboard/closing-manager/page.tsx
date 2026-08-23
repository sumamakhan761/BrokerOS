"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { ClosingManagerTasks } from "./components/ClosingManagerTasks";
import {
  CheckCircle2, Home, Users, Building2, TrendingUp, DollarSign,
} from "lucide-react";

export default function ClosingManagerDashboard({ viewAsEmployeeId }: { viewAsEmployeeId?: string }) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [data, setData]     = useState<any>(null);

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
  }, []);

  const { widgets } = data ?? {};

  const generalStatItems = widgets ? [
    { label: "Total Bookings",            value: widgets.totalBookings ?? 0,    icon: CheckCircle2, accent: "#15803d" },
    { label: "Total Units Sold",          value: widgets.totalUnitsSold ?? 0,   icon: Home,         accent: "#0369a1" },
    { label: "Brokers (Deals Closed)",    value: widgets.totalBrokers ?? 0,     icon: Users,        accent: "#7c3aed" },
  ] : [];

  const revenueStatItems = widgets ? [
    { label: "Total Booking Revenue",     value: "₹" + ((widgets.totalBookingRevenue || 0) / 100000).toFixed(1) + "L",   icon: Building2,  accent: "#15803d", sub: "Tokens at booking" },
    { label: "Total Revenue Generated",   value: "₹" + ((widgets.totalRevenueGenerated || 0) / 100000).toFixed(1) + "L", icon: TrendingUp,  accent: "#6d28d9", sub: "Agreed price on closed deals" },
    { label: "Total Broker Commission",   value: "₹" + ((widgets.totalBrokerCommission || 0) / 100000).toFixed(1) + "L", icon: DollarSign,  accent: "#b45309", sub: "Commission for brokers" },
  ] : [];

  return (
    <DashboardPageWrapper
      loading={status === "loading"}
      error={status === "error" ? "Failed to load dashboard. Please try again." : null}
      title="Closing Overview"
      subtitle="Track your bookings, revenue, and active brokers."
    >
      {/* General stats */}
      {widgets && <StatCards items={generalStatItems} cols={3} />}

      {/* Revenue section header */}
      {widgets && (
        <div style={{
          fontSize: "var(--text-lg)",
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}>
          Revenue & Performance
        </div>
      )}

      {/* Revenue stats */}
      {widgets && <StatCards items={revenueStatItems} cols={3} />}

      {/* Tabbed task lists */}
      {data && <ClosingManagerTasks dashData={data} />}
    </DashboardPageWrapper>
  );
}
