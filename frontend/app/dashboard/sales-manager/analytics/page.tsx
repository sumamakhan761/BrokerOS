"use client";

import React, { useEffect, useState } from 'react';
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2, TrendingUp, Users } from "lucide-react";

// Reuse the highly polished components from the Sales Executive analytics
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
  const [timeRange, setTimeRange] = useState('monthly');
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

      const res = await authClient.$fetch<any>(`/api/dashboard/sales-manager/analytics?timeRange=${timeRange}`, { baseURL: baseUrl });

      if (res.data) setAnalyticsData(res.data);

    } catch (e: any) {
      setError(e?.message || "Failed to load team analytics");
    } finally {
      setLoading(false);
    }
  };

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
        @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        .animate-pulse-fast { animation: pulse-fast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Team Performance Analytics</h1>
          </div>
          <p className="text-sm font-medium text-slate-500">
            Track your team's aggregate revenue, pipeline conversion, and project inventory velocity.
          </p>
        </div>
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
      </div>

      {loading ? (
        // Skeleton Loaders
        <div className="animate-pulse-fast flex flex-col gap-8">
          <div className="h-[120px] bg-slate-200/60 rounded-2xl w-full"></div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 h-[400px] bg-slate-200/60 rounded-2xl"></div>
            <div className="xl:col-span-2 h-[400px] bg-slate-200/60 rounded-2xl"></div>
          </div>

          <div className="mt-8 h-[600px] bg-slate-200/60 rounded-2xl w-full"></div>
        </div>
      ) : analyticsData ? (
        <>
          <FinancialOverview financialData={analyticsData.financial} />

          <DetailedMetricsGrid metrics={analyticsData.detailedMetrics} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <div className="xl:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Team Conversion Funnel
                </h3>
                <div className="flex-1">
                  <ConversionFunnelChart funnelData={analyticsData.funnel} />
                </div>
              </div>
            </div>
            <div className="xl:col-span-2 flex flex-col">
              {/* Leaderboard takes the right spot */}
              {analyticsData.leaderboard && (
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-6 pb-2 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      Team Leaderboard
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Ranking of Sales Executives under your management</p>
                  </div>
                  <Leaderboard
                    title="Team Leaderboard"
                    entries={analyticsData.leaderboard || []}
                    currentUserId=""
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

          <div className="mt-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 px-2">
              Assigned Inventory Health
            </h3>
            <TowerHeatmap inventoryData={analyticsData.inventory} />
          </div>
        </>
      ) : null}
    </div>
  );
}
