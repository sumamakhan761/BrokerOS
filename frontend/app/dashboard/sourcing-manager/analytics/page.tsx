"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Filter } from "lucide-react";

import { Overview } from "./_components/Overview";
import { RevenueCharts } from "./_components/RevenueCharts";
import { Insights } from "./_components/Insights";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("all-time");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setStatus("loading");
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const res = await authClient.$fetch(`/api/dashboard/sourcing-manager/analytics?range=${timeRange}`, { baseURL: baseUrl });
        if ((res as any).error) {
          throw new Error((res as any).error.message || "Failed to load analytics");
        }
        setData((res as any).data ?? res);
        setStatus("success");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }
    fetchAnalytics();
  }, [timeRange]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header and Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sourcing Analytics</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Deep dive into performance, conversions, and project revenues.</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          {['weekly', 'monthly', 'yearly', 'all-time'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${timeRange === range
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {status === "loading" && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="p-8 rounded-3xl bg-red-50 border border-red-100 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Failed to Load Analytics</h2>
            <p className="text-red-500 text-sm">Please check your connection or backend implementation.</p>
          </div>
        </div>
      )}

      {status === "success" && data && (
        <div className="space-y-10">
          <Overview topWidgets={data.topWidgets} />
          <RevenueCharts charts={data.charts} />
          <Insights data={data} />
        </div>
      )}
    </div>
  );
}
