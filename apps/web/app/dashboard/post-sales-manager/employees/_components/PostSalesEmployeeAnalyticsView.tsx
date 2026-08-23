import React, { useEffect, useState } from 'react';
import { authClient } from "@/lib/auth-client";
import { Loader2, Filter } from "lucide-react";
import { PostSalesAnalyticsWidgets, PostSalesAnalyticsWidgetsData } from "../../../post-sales/components/PostSalesAnalyticsWidgets";
import { VelocityGauge } from "../../../post-sales/components/VelocityGauge";
import { StatusPieChart } from "../../../post-sales/components/StatusPieChart";
import { InventorySellThroughChart, InventorySellThroughData } from "../../../post-sales/components/InventorySellThroughChart";
import PremiumBarChart from '@/components/analytics/PremiumBarChart';

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

export function PostSalesEmployeeAnalyticsView({ employeeId }: { employeeId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('monthly');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const res = await authClient.$fetch<AnalyticsData>(
          `/api/dashboard/post-sales-manager/employees/${employeeId}/analytics?timeRange=${timeRange}`,
          { baseURL: baseUrl }
        );
        if (res.data) setData(res.data);
        else if (res.error) throw new Error(res.error.message || "Failed to load analytics");
      } catch (e: any) {
        setError(e?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [employeeId, timeRange]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium">Crunching the numbers...</p>
      </div>
    );
  }

  if (error || !data) {
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

      {/* Time Range Filter */}
      <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm self-end">
        <Filter className="w-4 h-4 text-slate-400 ml-2" />
        {[
          { id: 'weekly', label: 'Weekly' },
          { id: 'monthly', label: 'Monthly' },
          { id: 'yearly', label: 'Yearly' },
          { id: 'all-time', label: 'All Time' }
        ].map(r => (
          <button
            key={r.id}
            onClick={() => setTimeRange(r.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${timeRange === r.id
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <PostSalesAnalyticsWidgets widgets={data.widgets} />

      <PremiumBarChart
        data={[
          { name: 'Booking', value: data.funnel.booking },
          { name: 'Document', value: data.funnel.document },
          { name: 'Loan', value: data.funnel.loan },
          { name: 'Agreement', value: data.funnel.agreement },
          { name: 'Handover', value: data.funnel.handover },
        ]}
        title="Post-Sales Funnel Progression"
        description="Conversion journey from initial booking to handover."
        dataKey="value"
        categoryKey="name"
        color="#ec4899"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <VelocityGauge days={data.velocity} />
        <StatusPieChart
          title="Loan Approval Success Rate"
          description="Breakdown of loan case statuses"
          data={[
            { name: 'Approved', value: data.loanSuccessRate.approved, color: '#10b981' },
            { name: 'In Progress', value: data.loanSuccessRate.inProgress, color: '#f59e0b' },
            { name: 'Rejected', value: data.loanSuccessRate.rejected, color: '#ef4444' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StatusPieChart
          title="Handover Readiness Status"
          description="Status of possession/handover readiness"
          data={[
            { name: 'Not Ready', value: data.handoverReadiness.notReady, color: '#ef4444' },
            { name: 'Scheduled', value: data.handoverReadiness.scheduled, color: '#3b82f6' },
            { name: 'Handed Over', value: data.handoverReadiness.handedOver, color: '#10b981' },
          ]}
        />
        <InventorySellThroughChart data={data.inventorySellThrough} />
      </div>
    </div>
  );
}
