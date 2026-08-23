import React, { useState } from 'react';
import { motion } from 'framer-motion';

export function DailyActivityHeatmap({ activityData }: { activityData: any[] }) {
  const [mode, setMode] = useState<'siteVisits' | 'followUps'>('siteVisits');

  if (!activityData) return null;

  // Generate last 90 days grid
  const days = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  const activityMap = new Map();
  activityData.forEach(d => {
    activityMap.set(d.date, d);
  });

  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-100';
    
    if (mode === 'siteVisits') {
      if (count === 1) return 'bg-emerald-200';
      if (count === 2) return 'bg-emerald-400';
      if (count >= 3) return 'bg-emerald-600';
    } else {
      if (count <= 2) return 'bg-blue-200';
      if (count <= 5) return 'bg-blue-400';
      if (count > 5) return 'bg-blue-600';
    }
    return 'bg-slate-100';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Daily Consistency (Last 90 Days)</h3>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setMode('siteVisits')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${mode === 'siteVisits' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Site Visits
          </button>
          <button
            onClick={() => setMode('followUps')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${mode === 'followUps' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Follow-ups
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 justify-end">
        {days.map((day, idx) => {
          const data = activityMap.get(day);
          const count = data ? data[mode] : 0;
          return (
            <div
              key={day}
              title={`${day}: ${count} ${mode === 'siteVisits' ? 'Site Visits' : 'Follow-ups'}`}
              className={`w-4 h-4 rounded-sm transition-colors cursor-help ${getColor(count)}`}
            />
          );
        })}
      </div>
      
      <div className="flex justify-end items-center gap-2 mt-4 text-xs font-medium text-slate-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-slate-100" />
          <div className={`w-3 h-3 rounded-sm ${mode === 'siteVisits' ? 'bg-emerald-200' : 'bg-blue-200'}`} />
          <div className={`w-3 h-3 rounded-sm ${mode === 'siteVisits' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
          <div className={`w-3 h-3 rounded-sm ${mode === 'siteVisits' ? 'bg-emerald-600' : 'bg-blue-600'}`} />
        </div>
        <span>More</span>
      </div>
    </motion.div>
  );
}
