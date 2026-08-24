"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import {
  PostSalesAnalyticsWidgets,
  PostSalesAnalyticsWidgetsData,
} from "../../../post-sales/components/PostSalesAnalyticsWidgets";
import { VelocityGauge } from "../../../post-sales/components/VelocityGauge";
import { StatusPieChart } from "../../../post-sales/components/StatusPieChart";
import {
  InventorySellThroughChart,
  InventorySellThroughData,
} from "../../../post-sales/components/InventorySellThroughChart";
import PremiumBarChart from "@/components/analytics/PremiumBarChart";

interface AnalyticsData {
  widgets: PostSalesAnalyticsWidgetsData;
  funnel: {
    booking: number;
    document: number;
    loan: number;
    agreement: number;
    handover: number;
  };
  velocity: number;
  loanSuccessRate: {
    approved: number;
    rejected: number;
    inProgress: number;
  };
  handoverReadiness: {
    notReady: number;
    scheduled: number;
    handedOver: number;
  };
  internalSalesDistribution: { projectName: string; soldUnits: number }[];
  inventorySellThrough: InventorySellThroughData[];
}

export function PostSalesEmployeeAnalyticsView({
  employeeId,
}: {
  employeeId: string;
}) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("monthly");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const res = await authClient.$fetch<AnalyticsData>(
          `/api/dashboard/post-sales-manager/employees/${employeeId}/analytics?timeRange=${timeRange}`,
          { baseURL: baseUrl }
        );
        if (res.data) setData(res.data);
        else if (res.error)
          throw new Error(res.error.message || "Failed to load analytics");
      } catch (e: any) {
        setError(e?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [employeeId, timeRange]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200/80 shadow-2xs gap-3">
        <Loader2 className="w-8 h-8 text-[var(--brand-600)] animate-spin" />
        <p className="text-xs font-semibold text-[var(--text-muted)] m-0">
          Crunching post-sales metrics…
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 text-rose-700 p-6 rounded-3xl border border-rose-200 text-xs font-bold">
        {error || "Failed to load analytics data"}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Time Range Filter */}
      <div className="flex justify-end">
        <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/60 w-fit">
          {[
            { id: "weekly", label: "Weekly" },
            { id: "monthly", label: "Monthly" },
            { id: "yearly", label: "Yearly" },
            { id: "all-time", label: "All Time" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setTimeRange(r.id)}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                timeRange === r.id
                  ? "bg-white text-[var(--text-primary)] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <PostSalesAnalyticsWidgets widgets={data.widgets} />

      <PremiumBarChart
        data={[
          { name: "Booking", value: data.funnel.booking },
          { name: "Document", value: data.funnel.document },
          { name: "Loan", value: data.funnel.loan },
          { name: "Agreement", value: data.funnel.agreement },
          { name: "Handover", value: data.funnel.handover },
        ]}
        title="Post-Sales Funnel Progression"
        description="Conversion journey from initial booking to key handover."
        dataKey="value"
        categoryKey="name"
        color="#9333ea"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <VelocityGauge days={data.velocity} />
        <StatusPieChart
          title="Loan Approval Success Rate"
          description="Breakdown of customer mortgage cases"
          data={[
            {
              name: "Approved",
              value: data.loanSuccessRate.approved,
              color: "#10b981",
            },
            {
              name: "In Progress",
              value: data.loanSuccessRate.inProgress,
              color: "#f59e0b",
            },
            {
              name: "Rejected",
              value: data.loanSuccessRate.rejected,
              color: "#ef4444",
            },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <StatusPieChart
          title="Handover Readiness Status"
          description="Status of possession/handover readiness"
          data={[
            {
              name: "Not Ready",
              value: data.handoverReadiness.notReady,
              color: "#ef4444",
            },
            {
              name: "Scheduled",
              value: data.handoverReadiness.scheduled,
              color: "#3b82f6",
            },
            {
              name: "Handed Over",
              value: data.handoverReadiness.handedOver,
              color: "#10b981",
            },
          ]}
        />
        <InventorySellThroughChart data={data.inventorySellThrough} />
      </div>
    </div>
  );
}
