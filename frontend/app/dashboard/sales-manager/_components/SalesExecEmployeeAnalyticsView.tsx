import React, { useEffect, useState } from 'react';
import { authClient } from "@/lib/auth-client";
import { Loader2, TrendingUp } from "lucide-react";
import { FinancialOverview } from "../../sales-executive/analytics/components/FinancialOverview";
import { ConversionFunnelChart } from "../../sales-executive/analytics/components/ConversionFunnelChart";
import { TowerHeatmap } from "../../sales-executive/analytics/components/TowerHeatmap";
import { ProjectAnalytics } from "../../sales-executive/analytics/components/ProjectAnalytics";
import { DailyActivityHeatmap } from "../../sales-executive/analytics/components/DailyActivityHeatmap";

export function SalesExecEmployeeAnalyticsView({ employeeId }: { employeeId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        
        const res = await authClient.$fetch<any>(`/api/dashboard/sales-manager/employees/${employeeId}/analytics`, { baseURL: baseUrl });
        
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
      <div className="min-h-[40vh] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium">Crunching the numbers...</p>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 font-medium">
        {error || "Failed to load analytics data"}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full animate-[fadeUp_0.4s_ease_forwards]">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
      
      <FinancialOverview financialData={analyticsData.financial} />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-1">
          <ConversionFunnelChart funnelData={analyticsData.funnel} />
        </div>
        <div className="xl:col-span-2">
          {/* Note: Removed Leaderboard from individual analytics view since it's an individual, not the whole team */}
          <div className="h-full bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center min-h-[400px]">
             <TrendingUp className="w-12 h-12 text-slate-200 mb-4" />
             <h3 className="text-lg font-bold text-slate-800">Conversion Funnel</h3>
             <p className="text-slate-500 text-sm mt-2 text-center max-w-sm">
               Review this employee's pipeline efficiency from initial contact to final booking.
             </p>
          </div>
        </div>
      </div>

      <TowerHeatmap inventoryData={analyticsData.inventory} />
      
      <DailyActivityHeatmap activityData={analyticsData.activity} />
      
      <ProjectAnalytics projectData={analyticsData.project} />
    </div>
  );
}
