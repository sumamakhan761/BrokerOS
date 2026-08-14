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

export function EmployeeAnalyticsView({ employeeId }: { employeeId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('monthly');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
        const res = await authClient.$fetch<AnalyticsData>(`/api/dashboard/pre-sales-manager/employees/${employeeId}/analytics`, {
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
  }, [employeeId, timeRange]);

  if (loading && !data) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium m-0">Crunching the numbers...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-red-900 m-0">Error loading analytics</h3>
          <p className="text-sm text-red-700 mt-1 m-0">{error || 'Unknown error'}</p>
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
  ];

  return (
    <div className="space-y-8 animate-[fadeUp_0.4s_ease_forwards]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 m-0">Performance Analytics</h2>
          <p className="text-xs font-medium text-slate-500 mt-1 m-0">
            Deep dive into pipeline progression, call performance, and conversion rates.
          </p>
        </div>

        {/* Time Range Segmented Control */}
        <div className="flex bg-slate-100 p-1.5 rounded-full w-fit">
          {ranges.map(r => (
            <button
              key={r.id}
              onClick={() => setTimeRange(r.id)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 border-none cursor-pointer ${timeRange === r.id
                ? 'bg-white shadow-sm text-slate-900'
                : 'text-slate-500 hover:text-slate-700 bg-transparent'
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start my-8">
            {/* Call Outcomes */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase m-0">Call Outcomes</h3>
                  <p className="text-[11px] font-medium text-slate-500 mt-1 m-0">What happens when you dial?</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-500 m-0">Avg Talk Time</p>
                    <p className="text-sm font-bold text-slate-900 m-0">{data.calls.avgTalkTimeSeconds} sec</p>
                  </div>
                </div>
              </div>
              <CallOutcomes outcomes={data.calls} />
            </div>

            {/* Call Performance */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 flex flex-col items-center justify-center overflow-hidden h-full">
              <h3 className="text-sm font-bold text-slate-900 uppercase mb-6 w-full text-left m-0">Call Performance</h3>
              <div className="flex-1 flex items-center justify-center w-full">
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
        </div>

        {/* Circular Metrics & Lead Sources */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 flex flex-col items-center justify-center overflow-hidden">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 w-full text-left m-0">Lead Conversion</h3>
            <CircularPercentage
              percentage={data.conversions.leadToSiteVisitPercentage}
              label="Lead to Site Visit"
              subLabel="Overall pipeline health"
              color="primary"
              delay={0.7}
            />
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 overflow-hidden">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-1 m-0">Best Lead Sources</h3>
            <p className="text-[11px] font-medium text-slate-500 mb-5 m-0">Sources driving site visits</p>
            <LeadSourceChart data={data.sources} />
          </div>
        </div>
      </div>
    </div>
  );
}
