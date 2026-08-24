"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import PremiumBarChart from "@/components/analytics/PremiumBarChart";
import {
  PostSalesAnalyticsWidgets,
  PostSalesAnalyticsWidgetsData,
} from "../components/PostSalesAnalyticsWidgets";
import { VelocityGauge } from "../components/VelocityGauge";
import { StatusPieChart } from "../components/StatusPieChart";
import {
  InventorySellThroughChart,
  InventorySellThroughData,
} from "../components/InventorySellThroughChart";
import { Loader2, TrendingUp } from "lucide-react";

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

export default function PostSalesAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("monthly");

  useEffect(() => {
    async function load() {
      try {
        setStatus("loading");
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const res = await authClient.$fetch<AnalyticsData>(
          `/api/dashboard/post-sales/analytics?timeRange=${timeRange}`,
          { baseURL: baseUrl }
        );

        if (res.data) {
          setData(res.data);
          setStatus("success");
        } else if (res.error) {
          throw new Error(res.error.message || "Failed to load analytics");
        } else {
          setData(res as any);
          setStatus("success");
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load analytics");
        setStatus("error");
      }
    }
    load();
  }, [timeRange]);

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5 m-0">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <TrendingUp size={18} />
            </div>
            <span>Post-Sales Analytics & Handover Velocity</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5 m-0">
            Monitor post-sales conversion funnels, loan sanction ratios & possession readiness
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/60">
          {[
            { id: "weekly", label: "Weekly" },
            { id: "monthly", label: "Monthly" },
            { id: "yearly", label: "Yearly" },
            { id: "all-time", label: "All Time" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setTimeRange(r.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
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

      {status === "loading" && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[var(--brand-600)] animate-spin" />
          <p className="text-xs font-semibold text-[var(--text-muted)]">
            Loading analytics…
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="bg-rose-50 text-rose-700 p-6 rounded-3xl border border-rose-200 text-xs font-bold">
          {error || "Failed to load post-sales analytics."}
        </div>
      )}

      {status === "success" && data && (
        <div className="space-y-8">
          {/* Top Widgets */}
          <PostSalesAnalyticsWidgets widgets={data.widgets} />

          {/* Post-Sales Funnel & Velocity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
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
            </div>
            <div className="lg:col-span-1 h-full">
              <VelocityGauge days={data.velocity} />
            </div>
          </div>

          {/* Status Pie Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
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
          </div>

          {/* Internal Project Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <StatusPieChart
              title="Internal Project Sales Distribution"
              description="Share of sold/reserved units per development"
              data={data.internalSalesDistribution.map((p, index) => {
                const colors = [
                  "#9333ea",
                  "#6366f1",
                  "#ec4899",
                  "#f59e0b",
                  "#10b981",
                  "#06b6d4",
                  "#3b82f6",
                ];
                return {
                  name: p.projectName,
                  value: p.soldUnits,
                  color: colors[index % colors.length],
                };
              })}
            />
            <InventorySellThroughChart data={data.inventorySellThrough} />
          </div>
        </div>
      )}
    </div>
  );
}
