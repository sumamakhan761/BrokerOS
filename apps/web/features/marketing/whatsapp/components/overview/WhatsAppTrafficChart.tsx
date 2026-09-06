'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface TrafficDay {
  day: string;
  date: string;
  outbound: number;
  inbound: number;
}

interface WhatsAppTrafficChartProps {
  traffic7Days: TrafficDay[];
}

export const WhatsAppTrafficChart: React.FC<WhatsAppTrafficChartProps> = ({
  traffic7Days = [],
}) => {
  const totalTrafficMessages = traffic7Days.reduce(
    (acc, d) => acc + d.outbound + d.inbound,
    0,
  );

  return (
    <div className="lg:col-span-2 p-6 bg-bg-surface border border-border-default rounded-2xl shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-text-primary text-sm">7-Day WhatsApp Traffic</h3>
          <p className="text-xs text-text-tertiary">
            Actual inbound customer messages vs outbound messages
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-text-secondary">Outbound</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-text-secondary">Inbound</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={traffic7Days}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.1)" />
            <XAxis dataKey="day" stroke="currentColor" className="text-[10px] text-text-tertiary" />
            <YAxis stroke="currentColor" allowDecimals={false} className="text-[10px] text-text-tertiary" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-surface, #1e293b)',
                borderColor: 'var(--border-default, #334155)',
                borderRadius: '0.75rem',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="outbound"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorOutbound)"
            />
            <Area
              type="monotone"
              dataKey="inbound"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorInbound)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {totalTrafficMessages === 0 && (
        <p className="text-[11px] text-center text-text-tertiary italic">
          No message traffic recorded in the past 7 days. Incoming chats and broadcast dispatches will chart here live.
        </p>
      )}
    </div>
  );
};
