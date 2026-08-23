import React from "react";
import { ArrowRight, Star, Trophy } from "lucide-react";
import { SectionHeader, fmt } from "./shared";

export function Insights({ data }: { data: any }) {
  return (
    <section>
      <SectionHeader title="Insights & Leaderboard" subtitle="Conversion rates, top projects, and best performing brokers." />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Conversion Funnel */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Conversion Funnel</h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="font-semibold text-slate-700">Leads Generated</span>
              <span className="text-xl font-black text-slate-900">{data.conversionRates?.leads || 0}</span>
            </div>
            <div className="flex justify-center -my-2 z-10"><ArrowRight className="w-5 h-5 text-slate-300 rotate-90" /></div>
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <span className="font-semibold text-indigo-700">Site Visits Completed</span>
              <span className="text-xl font-black text-indigo-900">{data.conversionRates?.siteVisits || 0}</span>
            </div>
            <div className="flex justify-center -my-2 z-10"><ArrowRight className="w-5 h-5 text-indigo-300 rotate-90" /></div>
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <span className="font-semibold text-emerald-700">Final Bookings</span>
              <span className="text-xl font-black text-emerald-900">{data.conversionRates?.bookings || 0}</span>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 shadow-sm flex-1 relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><Star size={20} /></div>
                <h3 className="font-bold text-amber-900">Most Selling Project</h3>
              </div>
              {data.mostSellingProject ? (
                <>
                  <h2 className="text-2xl font-black text-amber-950 mb-1">{data.mostSellingProject.name}</h2>
                  <p className="text-sm font-semibold text-amber-800/70">{data.mostSellingProject.unitsSold} units sold</p>
                  <p className="text-xl font-bold text-amber-900 mt-4">{fmt(data.mostSellingProject.revenue)}</p>
                </>
              ) : <p className="text-sm text-amber-800">No project data</p>}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex-1 flex flex-col justify-center items-center text-center">
            <p className="text-sm font-bold text-slate-500 mb-2">Broker Activation Rate</p>
            <div className="relative">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle 
                  cx="48" 
                  cy="48" 
                  r="36" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray="226.2" 
                  strokeDashoffset={226.2 - (226.2 * (data.brokerActivationRate || 0)) / 100} 
                  className="text-indigo-600 transition-all duration-1000" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black text-slate-900">{data.brokerActivationRate || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Brokers Leaderboard */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="text-yellow-500" size={20} />
            <h3 className="font-bold text-slate-900">Top 5 Brokers</h3>
          </div>
          <div className="flex flex-col gap-4">
            {data.top5Brokers?.map((broker: any) => (
              <div key={broker.rank} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    broker.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                    broker.rank === 2 ? 'bg-slate-200 text-slate-700' :
                    broker.rank === 3 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    #{broker.rank}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{broker.name}</p>
                    <p className="text-xs text-slate-500">{broker.unitsSold} units</p>
                  </div>
                </div>
              </div>
            ))}
            {(!data.top5Brokers || data.top5Brokers.length === 0) && (
              <p className="text-sm text-slate-400 text-center py-8">No active brokers</p>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
