'use client';

import React, { useEffect, useState } from 'react';
import PremiumBarChart from '@/components/analytics/PremiumBarChart';
import { CircularPercentage } from '@/components/analytics/CircularPercentage';
import { StatCard } from '@/components/analytics/StatCard';
import { CallOutcomes } from '@/components/analytics/CallOutcomes';
import { LeadSourceChart } from '@/components/analytics/LeadSourceChart';
import { PhoneOutgoing, PhoneIncoming, Target, CheckCircle2, TrendingUp, XCircle, AlertCircle, PhoneCall, UserPlus, Heart, Calendar, Building2, ListChecks, Clock, XSquare, Target as TargetIcon } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';

interface AnalyticsData {
  pipeline: {
    totalLeads: number;
    newLeads: number;
    contacted: number;
    interested: number;
    qualified: number;
    visitScheduled: number;
    visitCompleted: number;
    siteVisits: number;
    booked: number;
    lost: number;
  };
  calls: {
    made: number;
    connected: number;
    notAnswered: number;
    busy: number;
    failed: number;
    voicemail: number;
    connectedPercentage: number;
    avgTalkTimeSeconds: number;
  };
  followUps: {
    completed: number;
  };
  sources: {
    source: string;
    count: number;
  }[];
  conversions: {
    leadToSiteVisitPercentage: number;
  };
}

export default function PreSalesAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('monthly');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
        const res = await authClient.$fetch<AnalyticsData>('/api/dashboard/pre-sales/analytics', {
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
        setError(e?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [timeRange]);

  if (loading && !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-sm text-default-500 font-medium">Crunching the numbers...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-danger-50 border border-danger-200 rounded-2xl p-6 m-4 flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-danger shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-danger-900">Error loading analytics</h3>
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

  const exportToCSV = () => {
    if (!data) return;
    
    // Create simple CSV
    const rows = [
      ['Metric', 'Value'],
      ['Total Leads', data.pipeline.totalLeads],
      ['New Leads', data.pipeline.newLeads],
      ['Contacted', data.pipeline.contacted],
      ['Interested', data.pipeline.interested],
      ['Qualified', data.pipeline.qualified],
      ['Site Visits', data.pipeline.siteVisits],
      ['Booked', data.pipeline.booked],
      ['Lost', data.pipeline.lost],
      [''],
      ['Calls Made', data.calls.made],
      ['Calls Connected', data.calls.connected],
      ['Connected Rate %', data.calls.connectedPercentage],
      [''],
      ['Follow-ups Done', data.followUps.completed],
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `presales_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-[fadeUp_0.4s_ease_forwards]">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-default-900 tracking-tight">Pre-Sales Analytics</h1>
          <p className="text-sm font-medium text-default-500 mt-1.5">
            Deep dive into your pipeline progression, call performance, and conversion rates.
          </p>
        </div>

        {/* Time Range Segmented Control & Export */}
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

      <h2 className="text-xl font-bold text-default-900 mt-2 mb-4">Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          title="Total Leads"
          value={data.pipeline.totalLeads}
          icon={Target}
          delay={0.1}
        />
        <StatCard
          title="Calls Made"
          value={data.calls.made}
          subtitle="Outbound dials"
          icon={PhoneOutgoing}
          delay={0.15}
        />
        <StatCard
          title="Calls Connected"
          value={data.calls.connected}
          subtitle="Conversations"
          icon={PhoneIncoming}
          delay={0.2}
        />
        <StatCard
          title="Follow-ups Done"
          value={data.followUps.completed}
          subtitle="Completed successfully"
          icon={ListChecks}
          delay={0.25}
        />
        <StatCard
          title="Lost Leads"
          value={data.pipeline.lost}
          icon={XCircle}
          trend="down"
          trendValue="Requires attention"
          delay={0.45}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-8">

        {/* Pipeline Bar Chart */}
        <div className="lg:col-span-2">
          <PremiumBarChart
            data={pipelineStages}
            title="Pipeline Progression"
            description="Cumulative historical progression"
            dataKey="value"
            categoryKey="name"
            color="#6366F1"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start my-12">

            {/* Call Outcomes */}
            <div className="bg-white dark:bg-default-100/50 rounded-2xl p-5 sm:p-6 shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-base font-bold text-default-900 uppercase">Call Outcomes</h3>
                  <p className="text-[11px] font-medium text-default-500 mt-1">What happens when you dial?</p>
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

            {/* Call Performance */}
            <div className="bg-white dark:bg-default-100/50 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col items-center justify-center overflow-hidden">
              <h3 className="text-sm font-bold text-default-900 uppercase mb-6 w-full text-left">Call Performance</h3>
              <CircularPercentage
                percentage={data.calls.connectedPercentage}
                label="Connected Rate"
                subLabel={`${data.calls.connected} / ${data.calls.made} Calls`}
                color={data.calls.connectedPercentage > 30 ? 'success' : 'warning'}
                delay={0.5}
              />
            </div>

          </div>
        </div>

        {/* Circular Metrics & Lead Sources */}
        <div className="lg:col-span-1 space-y-8">

          <div className="bg-white dark:bg-default-100/50 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col items-center justify-center overflow-hidden">
            <h3 className="text-sm font-bold text-default-900 uppercase tracking-widest mb-6 w-full text-left">Lead Conversion</h3>
            <CircularPercentage
              percentage={data.conversions.leadToSiteVisitPercentage}
              label="Lead to Site Visit"
              subLabel="Overall pipeline health"
              color="primary"
              delay={0.7}
            />
          </div>

          <div className="bg-white dark:bg-default-100/50 rounded-2xl p-5 sm:p-6 shadow-sm overflow-hidden">
            <h3 className="text-sm font-bold text-default-900 uppercase tracking-widest mb-1">Best Lead Sources</h3>
            <p className="text-[11px] font-medium text-default-500 mb-5">Sources driving site visits</p>
            <LeadSourceChart data={data.sources} />
          </div>

        </div>
      </div>


    </div>
  );
}
