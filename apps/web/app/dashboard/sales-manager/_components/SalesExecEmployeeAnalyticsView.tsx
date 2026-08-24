"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2, TrendingUp } from "lucide-react";
import { FinancialOverview } from "../../sales-executive/analytics/components/FinancialOverview";
import { ConversionFunnelChart } from "../../sales-executive/analytics/components/ConversionFunnelChart";
import { TowerHeatmap } from "../../sales-executive/analytics/components/TowerHeatmap";
import { ProjectAnalytics } from "../../sales-executive/analytics/components/ProjectAnalytics";
import { DailyActivityHeatmap } from "../../sales-executive/analytics/components/DailyActivityHeatmap";

export function SalesExecEmployeeAnalyticsView({
  employeeId,
}: {
  employeeId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

        const res = await authClient.$fetch<any>(
          `/api/dashboard/sales-manager/employees/${employeeId}/analytics`,
          { baseURL: baseUrl }
        );

        if (res.data) setAnalyticsData(res.data);
      } catch (e: any) {
        setError(e?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200/80 shadow-2xs gap-3">
        <Loader2 className="w-8 h-8 text-[var(--brand-600)] animate-spin" />
        <p className="text-xs font-semibold text-[var(--text-muted)] m-0">
          Calculating executive analytics…
        </p>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="bg-rose-50 text-rose-700 p-6 rounded-3xl border border-rose-200 text-xs font-bold">
        {error || "Failed to load analytics data"}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FinancialOverview financialData={analyticsData.financial} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ConversionFunnelChart funnelData={analyticsData.funnel} />
        </div>
        <div className="lg:col-span-2">
          <div className="h-full bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 flex flex-col items-center justify-center min-h-[360px] text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)] mb-3">
              <TrendingUp size={22} />
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] m-0">
              Deal Progression Analysis
            </h3>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-1 max-w-sm m-0">
              Audit this executive's site visits, negotiation discount velocity & final booking closure rates.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0 px-1">
          Project Inventory Velocity
        </h3>
        <TowerHeatmap inventoryData={analyticsData.inventory} />
      </div>

      <DailyActivityHeatmap activityData={analyticsData.activity} />

      <ProjectAnalytics projectData={analyticsData.project} />
    </div>
  );
}
