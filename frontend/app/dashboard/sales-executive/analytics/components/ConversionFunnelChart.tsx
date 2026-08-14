import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function ConversionFunnelChart({ funnelData }: { funnelData: any }) {
  if (!funnelData) return null;

  const data = [
    { name: 'Total Leads', value: funnelData.leads || 0, color: '#e2e8f0' }, // slate-200
    { name: 'Site Visits', value: funnelData.siteVisits || 0, color: '#93c5fd' }, // blue-300
    { name: 'Negotiations', value: funnelData.negotiations || 0, color: '#c084fc' }, // purple-400
    { name: 'Reserved', value: funnelData.reserved || 0, color: '#fde047' }, // yellow-300
    { name: 'Sold', value: funnelData.sold || 0, color: '#10b981' } // emerald-500
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col"
    >
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-bold text-slate-800">Conversion Pipeline</h3>
        <div className="flex flex-col items-end">
          <div className="text-2xl font-black text-indigo-600 leading-none">{funnelData.conversionRate || "0.0"}%</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Win Rate</div>
        </div>
      </div>
      <div className="flex-1 w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
