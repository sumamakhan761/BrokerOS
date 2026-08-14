"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Filter, AlertCircle, Loader2 } from "lucide-react";
import { Overview } from "./_components/Overview";
import { BookingFunnel } from "./_components/BookingFunnel";
import { RevenueCharts } from "./_components/RevenueCharts";
import { InventoryAnalytics } from "./_components/InventoryAnalytics";
import { BrokerPerformance } from "./_components/BrokerPerformance";
import { SMLeaderboard } from "./_components/SMLeaderboard";
import { CMLeaderboard } from "./_components/CMLeaderboard";
import { ConversionAnalytics } from "./_components/ConversionAnalytics";
import { BrokerageSettlement } from "./_components/BrokerageSettlement";
import { SiteVisitAnalytics } from "./_components/SiteVisitAnalytics";

export default function CPAnalyticsPage() {
  const [range, setRange] = useState("all-time");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setStatus("loading");
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const res = await authClient.$fetch(`/api/dashboard/channel-partner/analytics?range=${range}`, { baseURL: baseUrl });
        if ((res as any).error) throw new Error("Failed");
        setData((res as any).data ?? res);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    }
    load();
  }, [range]);

  const ranges = ["weekly", "monthly", "yearly", "all-time"];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">CP Analytics</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Deep dive into your channel partner business performance.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          {ranges.map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${range === r ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
              {r.charAt(0).toUpperCase() + r.slice(1).replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {status === "loading" && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="p-8 rounded-3xl bg-red-50 border border-red-100 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-red-600 mb-1">Failed to Load Analytics</h2>
            <p className="text-red-500 text-sm">Check your connection or backend status.</p>
          </div>
        </div>
      )}

      {status === "success" && data && (
        <>
          <Overview topWidgets={data.topWidgets} />
          <BookingFunnel bookingFunnel={data.bookingFunnel} />
          <RevenueCharts revenueCharts={data.revenueCharts} />
          <InventoryAnalytics inventoryAnalytics={data.inventoryAnalytics} />
          <BrokerPerformance brokerPerformance={data.brokerPerformance} />
          <SMLeaderboard smLeaderboard={data.smLeaderboard} />
          <CMLeaderboard cmLeaderboard={data.cmLeaderboard} />
          <ConversionAnalytics conversionRates={data.conversionRates} />
          <BrokerageSettlement brokerageSettlement={data.brokerageSettlement} />
          <SiteVisitAnalytics siteVisitAnalytics={data.siteVisitAnalytics} />
        </>
      )}
    </div>
  );
}
