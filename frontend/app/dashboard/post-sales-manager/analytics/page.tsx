"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import PremiumBarChart from '@/components/analytics/PremiumBarChart';
import { PostSalesAnalyticsWidgets, PostSalesAnalyticsWidgetsData } from "../components/PostSalesAnalyticsWidgets";
import { VelocityGauge } from "../components/VelocityGauge";
import { StatusPieChart } from "../components/StatusPieChart";
import { InventorySellThroughChart, InventorySellThroughData } from "../components/InventorySellThroughChart";
import { Loader2 } from "lucide-react";

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

export default function PostSalesAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('monthly');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
        const res = await authClient.$fetch<AnalyticsData>(`/api/dashboard/post-sales/analytics?timeRange=${timeRange}`, { baseURL: baseUrl });

        if (res.data) {
          setData(res.data);
        }
        if (res.error) {
          throw new Error(res.error.message || "Failed to load analytics");
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [timeRange]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm font-medium">Loading analytics…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8 bg-red-50 rounded-2xl border border-red-200 text-red-500">
      <strong>Error:</strong> {error}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Post-Sales Analytics
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Monitor your team's post-sales performance, funnels, and revenue.
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

      {/* ── Top Widgets ── */}
      {data && <PostSalesAnalyticsWidgets widgets={data.widgets} />}

      {/* ── Post-Sales Funnel ── */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mt-4">
          <div className="lg:col-span-2">
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
          </div>
          <div className="lg:col-span-1">
            <VelocityGauge days={data.velocity} />
          </div>
        </div>
      )}

      {/* ── Status Pie Charts (Phase 5 & 6) ── */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-4">
          <StatusPieChart
            title="Loan Approval Success Rate"
            description="Breakdown of loan case statuses"
            data={[
              { name: 'Approved', value: data.loanSuccessRate.approved, color: '#10b981' }, // green
              { name: 'In Progress', value: data.loanSuccessRate.inProgress, color: '#f59e0b' }, // amber
              { name: 'Rejected', value: data.loanSuccessRate.rejected, color: '#ef4444' }, // red
            ]}
          />
          <StatusPieChart
            title="Handover Readiness Status"
            description="Status of possession/handover readiness"
            data={[
              { name: 'Not Ready', value: data.handoverReadiness.notReady, color: '#ef4444' },
              { name: 'Scheduled', value: data.handoverReadiness.scheduled, color: '#3b82f6' }, // blue
              { name: 'Handed Over', value: data.handoverReadiness.handedOver, color: '#10b981' },
            ]}
          />
        </div>
      )}

      {/* ── Internal Project Analytics ── */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mt-4">
          <StatusPieChart
            title="Internal Sales Distribution"
            description="Percentage share of total sold/reserved units per project"
            data={data.internalSalesDistribution.map((p, index) => {
              const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];
              return { name: p.projectName, value: p.soldUnits, color: colors[index % colors.length] };
            })}
          />
          <InventorySellThroughChart data={data.inventorySellThrough} />
        </div>
      )}

    </div>
  );
}
