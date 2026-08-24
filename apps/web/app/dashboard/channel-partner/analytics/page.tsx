"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { AlertCircle, Loader2, TrendingUp } from "lucide-react";
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
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setStatus("loading");
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const res = await authClient.$fetch(
          `/api/dashboard/channel-partner/analytics?range=${range}`,
          { baseURL: baseUrl }
        );
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
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5 m-0">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <TrendingUp size={18} />
            </div>
            <span>Channel Partner Enterprise Analytics</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5 m-0">
            Comprehensive business intelligence across broker networks, sourcing/closing teams & development inventory
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/60 w-fit">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                range === r
                  ? "bg-white text-[var(--text-primary)] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1).replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {status === "loading" && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[var(--brand-600)] animate-spin" />
          <p className="text-xs font-semibold text-[var(--text-muted)]">
            Aggregating channel partner analytics…
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h2 className="text-sm font-bold text-rose-700 mb-0.5">
            Failed to Load CP Analytics
          </h2>
          <p className="text-xs text-rose-600 font-medium m-0">
            Please check network connectivity or backend API endpoints.
          </p>
        </div>
      )}

      {status === "success" && data && (
        <div className="space-y-8">
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
        </div>
      )}
    </div>
  );
}
