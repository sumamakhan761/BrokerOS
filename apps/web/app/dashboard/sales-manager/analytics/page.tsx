"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2, TrendingUp, Users, Download } from "lucide-react";

import { FinancialOverview } from "../../sales-executive/analytics/components/FinancialOverview";
import { ConversionFunnelChart } from "../../sales-executive/analytics/components/ConversionFunnelChart";
import { TowerHeatmap } from "../../sales-executive/analytics/components/TowerHeatmap";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { DetailedMetricsGrid } from "../_components/DetailedMetricsGrid";

export default function SalesManagerAnalyticsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("monthly");
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!isPending && !userId) {
      router.replace("/login");
      return;
    }

    if (userId) {
      loadData();
    }
  }, [userId, isPending, router, timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

      const res = await authClient.$fetch<any>(
        `/api/dashboard/sales-manager/analytics?timeRange=${timeRange}`,
        { baseURL: baseUrl }
      );

      if (res.data) setAnalyticsData(res.data);
    } catch (e: any) {
      setError(e?.message || "Failed to load team analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!analyticsData) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Metric,Value\n" +
      `Time Range,${timeRange}\n` +
      `Total Revenue,${analyticsData.financial?.totalRevenue || 0}\n` +
      `Deals Closed,${analyticsData.financial?.dealsClosed || 0}\n` +
      `Average Deal Size,${analyticsData.financial?.averageDealSize || 0}\n` +
      `Pipeline Value,${analyticsData.financial?.pipelineValue || 0}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `sales-manager-analytics-${timeRange}-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
        <div className="bg-rose-50 text-rose-700 p-6 rounded-3xl border border-rose-200 text-xs font-bold">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5 m-0">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <Users size={18} />
            </div>
            <span>Team Sales Analytics & Forecasting</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5 m-0">
            Audit aggregate sales revenue, team deal velocity & project tower inventory status
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time Range Selector */}
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

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-[0.96] press-effect shadow-2xs cursor-pointer"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[var(--brand-600)] animate-spin" />
          <p className="text-xs font-semibold text-[var(--text-muted)]">
            Synthesizing team sales metrics…
          </p>
        </div>
      ) : analyticsData ? (
        <div className="space-y-8">
          <FinancialOverview financialData={analyticsData.financial} />

          <DetailedMetricsGrid metrics={analyticsData.detailedMetrics} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1">
              <ConversionFunnelChart funnelData={analyticsData.funnel} />
            </div>
            <div className="lg:col-span-2">
              {analyticsData.leaderboard && (
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
                      Team Sales Leaderboard
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 m-0">
                      Ranked performance across Sales Executives
                    </p>
                  </div>
                  <Leaderboard
                    title="Executive Performance"
                    entries={analyticsData.leaderboard || []}
                    currentUserId=""
                    columns={[
                      { key: "svCompleted", label: "SVs" },
                      { key: "activeNegotiations", label: "Neg" },
                      { key: "bookings", label: "Books" },
                      { key: "score", label: "Score" },
                    ]}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0 px-1">
              Assigned Project Inventory Velocity
            </h3>
            <TowerHeatmap inventoryData={analyticsData.inventory} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
