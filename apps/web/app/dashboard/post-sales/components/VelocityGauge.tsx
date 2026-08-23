"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface VelocityGaugeProps {
  days: number;
  label?: string;
  subLabel?: string;
  maxDays?: number;
}

export function VelocityGauge({ days, label = "Average Velocity", subLabel = "Booking to Handover", maxDays = 120 }: VelocityGaugeProps) {
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Semi-circle

  // Calculate percentage (clamped to 100%)
  const percentage = Math.min((days / maxDays) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color logic (green for fast, amber for medium, red for slow)
  const isFast = days <= 30;
  const isMedium = days > 30 && days <= 60;
  const color = isFast ? "#10b981" : isMedium ? "#f59e0b" : "#ef4444";
  const glowId = "glow-velocity";

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden widget-card" style={{ height: '100%' }}>
      <div className="text-center w-full mb-6 relative z-10">
        <h3 className="text-lg font-bold text-slate-800">{label}</h3>
        <p className="text-xs text-slate-500 font-medium">{subLabel}</p>
      </div>

      <div className="relative mt-2" style={{ width: size, height: size / 2 }}>
        <svg
          width={size}
          height={size / 2}
          viewBox={`0 0 ${size} ${size / 2}`}
          className="overflow-visible"
        >
          <defs>
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={color} floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background Arc */}
          <path
            d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Foreground Arc */}
          <motion.path
            d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
            filter={`url(#${glowId})`}
          />
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-col items-center"
          >
            <span className="text-3xl font-black" style={{ color }}>{days}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Days</span>
          </motion.div>
        </div>
      </div>
      
      <div className="w-full flex justify-between px-4 mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-wide z-10">
        <span>0 Days</span>
        <span>{maxDays}+ Days</span>
      </div>
    </div>
  );
}
