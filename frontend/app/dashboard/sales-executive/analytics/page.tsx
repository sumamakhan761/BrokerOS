"use client";

import React, { useEffect, useState } from 'react';
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2, TrendingUp, Download } from "lucide-react";
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
  const [timeRange, setTimeRange] = useState('monthly');

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
        authClient.$fetch<any>(`/api/dashboard/sales-executive/analytics?timeRange=${timeRange}`, { baseURL: baseUrl }),
        authClient.$fetch<any>("/api/dashboard/sales-executive/leaderboard", { baseURL: baseUrl })
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
      ['Metric', 'Value'],
      ['Total Revenue', analyticsData.financial?.totalRevenue],
      ['Realized Commission', analyticsData.financial?.realizedCommission],
      ['Projected Commission', analyticsData.financial?.projectedCommission],
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `sales_exec_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium">Loading premium analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 font-medium">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto pb-12 w-full animate-[fadeUp_0.4s_ease_forwards] p-6 lg:p-8 bg-slate-50/50 min-h-screen">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Performance Analytics</h1>
          </div>
          <p className="text-sm font-medium text-slate-500">
            Track your revenue, pipeline conversion, and tower inventory in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white shadow-sm border border-slate-100 rounded-lg p-1">
            {[
              { id: 'weekly', label: 'Weekly' },
              { id: 'monthly', label: 'Monthly' },
              { id: 'yearly', label: 'Yearly' },
              { id: 'all-time', label: 'All Time' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setTimeRange(r.id)}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${timeRange === r.id
                  ? 'bg-slate-100 text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={exportToCSV}
            className="px-5 py-1.5 rounded-lg text-sm font-semibold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors shadow-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {analyticsData && (
        <>
          <FinancialOverview financialData={analyticsData.financial} />
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <div className="xl:col-span-1">
              <ConversionFunnelChart funnelData={analyticsData.funnel} />
            </div>
            <div className="xl:col-span-2 flex flex-col">
              {/* Leaderboard takes the right spot */}
              {leaderboardData && (
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <Leaderboard
                    title="Monthly Leaderboard"
                    entries={leaderboardData.leaderboard || []}
                    currentUserId={leaderboardData.currentUserId || ""}
                    columns={[
                      { key: "svCompleted",        label: "SVs"  },
                      { key: "activeNegotiations", label: "Neg"  },
                      { key: "bookings",           label: "Books" },
                      { key: "score",              label: "Score" },
                    ]}
                  />
                </div>
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
