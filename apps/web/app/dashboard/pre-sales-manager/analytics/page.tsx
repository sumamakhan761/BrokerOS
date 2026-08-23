'use client';

import React, { useEffect, useState } from 'react';
import PremiumBarChart from '@/components/analytics/PremiumBarChart';
import { CircularPercentage } from '@/components/analytics/CircularPercentage';
import { StatCard } from '@/components/analytics/StatCard';
import { CallOutcomes } from '@/components/analytics/CallOutcomes';
import { LeadSourceChart } from '@/components/analytics/LeadSourceChart';
import { ConnectionHeatmap } from '@/components/analytics/ConnectionHeatmap';
import { PhoneOutgoing, PhoneIncoming, Target, Target as TargetIcon, CheckCircle2, TrendingUp, XCircle, AlertCircle, PhoneCall, UserPlus, Heart, Calendar, Building2, ListChecks, Clock, Zap } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';

export default function ManagerAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('monthly');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
        const res = await authClient.$fetch<any>('/api/dashboard/pre-sales-manager/analytics', {
          baseURL: baseUrl,
          query: { timeRange }
        });

        if (res.data) {
          setData(res.data);
        }
        if (res.error) {
          throw new Error(res.error.message || 'Failed to load analytics');
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load team analytics');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [timeRange]);

  const exportToCSV = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value'],
      ['Team Total Leads', data.pipeline.totalLeads],
      ['Team Calls Made', data.calls.made],
      ['Lost Leads', data.pipeline.lost],
      ['Speed to Lead (min)', data.managerMetrics.avgSpeedToLeadMinutes],
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `team_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-sm text-default-500 font-medium">Aggregating team data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-danger-50 border border-danger-200 rounded-2xl p-6 m-4 flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-danger shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-danger-900">Error loading team analytics</h3>
          <p className="text-sm text-danger-700 mt-1">{error || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  const pipelineStages = [
    { name: 'Total Leads', value: data.pipeline.totalLeads },
    { name: 'New Leads', value: data.pipeline.newLeads },
    { name: 'Contacted', value: data.pipeline.contacted },
    { name: 'Interested', value: data.pipeline.interested },
    { name: 'Qualified', value: data.pipeline.qualified },
    { name: 'Site Visits', value: data.pipeline.siteVisits },
    { name: 'Booked', value: data.pipeline.booked },
  ];

  const ranges = [
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'yearly', label: 'Yearly' },
    { id: 'all-time', label: 'All Time' },
  ];

  // Calculate Funnel Drop-off between New -> Contacted -> Interested -> Qualified
  const contactedDropoff = data.pipeline.newLeads > 0
    ? Math.round(((data.pipeline.newLeads - data.pipeline.contacted) / data.pipeline.newLeads) * 100) : 0;

  const siteVisitConversion = data.pipeline.qualified > 0
    ? Math.round((data.pipeline.siteVisits / data.pipeline.qualified) * 100) : 0;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-[fadeUp_0.4s_ease_forwards]">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-default-900 tracking-tight">Team Analytics</h1>
          <p className="text-sm font-medium text-default-500 mt-1.5">
            Aggregated performance, pipeline health, and call trends across your entire team.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex bg-default-100 dark:bg-default-100/50 p-1.5 rounded-full w-fit">
            {ranges.map(r => (
              <button
                key={r.id}
                onClick={() => setTimeRange(r.id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${timeRange === r.id
                  ? 'bg-white dark:bg-default-200 shadow-sm text-default-900'
                  : 'text-default-500 hover:text-default-700'
                  }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={exportToCSV}
            className="px-5 py-2 rounded-full text-sm font-semibold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors shadow-sm flex items-center gap-2"
          >
            Export CSV
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold text-default-900 mt-2 mb-4">Team Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard title="Team Leads" value={data.pipeline.totalLeads} icon={Target} delay={0.1} />
        <StatCard title="Calls Made" value={data.calls.made} icon={PhoneOutgoing} delay={0.15} />
        <StatCard title="Calls Connected" value={data.calls.connected} icon={PhoneIncoming} delay={0.2} />
        <StatCard title="Follow-ups" value={data.followUps.completed} icon={ListChecks} delay={0.25} />
        <StatCard title="Lost Leads" value={data.pipeline.lost} icon={XCircle} trend="down" trendValue="Check drop-offs" delay={0.3} />
        <StatCard title="Speed to Lead" value={`${data.managerMetrics.avgSpeedToLeadMinutes}m`} subtitle="Avg response time" icon={Zap} delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-8">

        {/* Pipeline Bar Chart */}
        <div className="lg:col-span-2">
          <PremiumBarChart
            data={pipelineStages}
            title="Team Pipeline Progression"
            description="Cumulative progression across all agents"
            dataKey="value"
            categoryKey="name"
            color="#6366F1"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start my-12">

            {/* Call Outcomes */}
            <div className="bg-white dark:bg-default-50 rounded-2xl p-6 shadow-sm border-none overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-default-900 uppercase tracking-tight">Team Call Outcomes</h3>
                  <p className="text-xs font-medium text-default-500 mt-1">Aggregated results</p>
                </div>
                <div className="flex items-center gap-3 bg-default-100/50 dark:bg-default-200/30 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-default-500">Avg Talk Time</p>
                    <p className="text-sm font-bold text-default-900">{data.calls.avgTalkTimeSeconds} sec</p>
                  </div>
                </div>
              </div>
              <CallOutcomes outcomes={data.calls} />
            </div>

            {/* Funnel Drop-off Analysis */}
            <div className="bg-white dark:bg-default-50 rounded-2xl p-6 shadow-sm border-none flex flex-col justify-center overflow-hidden h-full">
              <div className="mb-6">
                <h3 className="text-base font-extrabold text-default-900 uppercase tracking-tight">Funnel Drop-offs</h3>
                <p className="text-xs font-medium text-default-500 mt-1">Pipeline leakage points</p>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-danger-50 dark:bg-danger-500/10 rounded-xl border-none">
                  <p className="text-sm text-danger-700 dark:text-danger-400 font-bold mb-1">New → Contacted</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-black text-danger-600">{contactedDropoff}% <span className="text-xs font-bold text-danger-500">Loss</span></span>
                    <span className="text-[10px] font-semibold text-danger-600/70 uppercase tracking-wider">Failed to reach</span>
                  </div>
                </div>
                <div className="p-4 bg-success-50 dark:bg-success-500/10 rounded-xl border-none">
                  <p className="text-sm text-success-700 dark:text-success-400 font-bold mb-1">Qualified → Site Visit</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-black text-success-600">{siteVisitConversion}% <span className="text-xs font-bold text-success-500">Win</span></span>
                    <span className="text-[10px] font-semibold text-success-600/70 uppercase tracking-wider">Successfully booked</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Lead Sources */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-default-50 rounded-2xl p-6 shadow-sm border-none flex flex-col items-center justify-center overflow-hidden">
            <h3 className="text-sm font-extrabold text-default-900 uppercase tracking-widest mb-6 w-full text-left">Team Conversion Rate</h3>
            <CircularPercentage
              percentage={data.conversions.leadToSiteVisitPercentage}
              label="Lead to Site Visit"
              subLabel="Overall pipeline health"
              color="primary"
              delay={0.7}
            />
          </div>

          <div className="bg-white dark:bg-default-50 rounded-2xl p-6 shadow-sm border-none overflow-hidden">
            <h3 className="text-sm font-extrabold text-default-900 uppercase tracking-widest mb-1">Best Lead Sources</h3>
            <p className="text-xs font-medium text-default-500 mb-5">Sources driving site visits for the team</p>
            <LeadSourceChart data={data.sources} />
          </div>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="bg-white dark:bg-default-50 rounded-2xl p-6 shadow-sm border-none overflow-hidden mt-8">
        <h3 className="text-lg font-extrabold text-default-900 mb-1 tracking-tight">Peak Connection Heatmap</h3>
        <p className="text-sm font-medium text-default-500 mb-6">Discover the best times (Day & Hour) to call leads based on team connect rates.</p>
        <ConnectionHeatmap data={data.managerMetrics.connectionHeatmap} />
      </div>

    </div>
  );
}
