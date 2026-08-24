"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2, TrendingUp, Download, BarChart3, AlertCircle } from "lucide-react";
import { FinancialOverview } from "./components/FinancialOverview";
import { ConversionFunnelChart } from "./components/ConversionFunnelChart";
import { TowerHeatmap } from "./components/TowerHeatmap";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { ProjectAnalytics } from "./components/ProjectAnalytics";
import { DailyActivityHeatmap } from "./components/DailyActivityHeatmap";

export default function SalesExecAnalyticsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState("monthly");

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
      return;
    }

    if (session) {
      loadData();
    }
  }, [session, isPending, router, timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

      const [analyticsRes, lbRes] = await Promise.all([
        authClient.$fetch<any>(
          `/api/dashboard/sales-executive/analytics?timeRange=${timeRange}`,
          { baseURL: baseUrl }
        ),
        authClient.$fetch<any>("/api/dashboard/sales-executive/leaderboard", {
          baseURL: baseUrl,
        }),
      ]);

      if (analyticsRes.data) setAnalyticsData(analyticsRes.data);
      if (lbRes.data) setLeaderboardData(lbRes.data);
    } catch (e: any) {
      setError(e?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!analyticsData) return;
    const rows: any[][] = [
      ["Metric", "Value"],
      ["Total Revenue", analyticsData.financial?.totalRevenue],
      ["Realized Commission", analyticsData.financial?.realizedCommission],
      ["Projected Commission", analyticsData.financial?.projectedCommission],
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `sales_exec_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !analyticsData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[var(--brand-600)] animate-spin" />
        <p className="text-xs font-semibold text-[var(--text-muted)]">
          Crunching sales performance metrics…
        </p>
      </div>
    );
  }

  if (error && !analyticsData) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 m-4 flex items-center gap-3 animate-enter">
        <AlertCircle size={20} className="text-rose-600 shrink-0" />
        <div>
          <h3 className="text-sm font-extrabold text-rose-900 m-0">
            Error loading performance analytics
          </h3>
          <p className="text-xs text-rose-700 mt-1 m-0">{error}</p>
        </div>
      </div>
    );
  }

  const ranges = [
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
    { id: "all-time", label: "All Time" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5 m-0">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <BarChart3 size={18} />
            </div>
            <span>Executive Performance Analytics</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5 m-0">
            Revenue tracking, conversion funnels, unit inventory heatmaps & daily consistency
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/60 shadow-2xs">
            {ranges.map((r) => (
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
          <button
            onClick={exportToCSV}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.96] press-effect shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {analyticsData && (
        <>
          <FinancialOverview financialData={analyticsData.financial} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1">
              <ConversionFunnelChart funnelData={analyticsData.funnel} />
            </div>
            <div className="xl:col-span-2">
              {leaderboardData && (
                <Leaderboard
                  title="Monthly Peer Leaderboard"
                  entries={leaderboardData.leaderboard || []}
                  currentUserId={leaderboardData.currentUserId || ""}
                  columns={[
                    { key: "svCompleted", label: "SVs" },
                    { key: "activeNegotiations", label: "Neg" },
                    { key: "bookings", label: "Books" },
                    { key: "score", label: "Score" },
                  ]}
                />
              )}
            </div>
          </div>

          <TowerHeatmap inventoryData={analyticsData.inventory} />

          <DailyActivityHeatmap activityData={analyticsData.activity} />

          <ProjectAnalytics projectData={analyticsData.project} />
        </>
      )}
    </div>
  );
}
