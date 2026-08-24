"use client";

import React from "react";
import { motion } from "framer-motion";

interface VelocityGaugeProps {
  days: number;
  label?: string;
  subLabel?: string;
  maxDays?: number;
}

export function VelocityGauge({
  days,
  label = "Average Handover Velocity",
  subLabel = "Booking to Key Handover",
  maxDays = 120,
}: VelocityGaugeProps) {
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;

  const percentage = Math.min((days / maxDays) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isFast = days <= 30;
  const isMedium = days > 30 && days <= 60;
  const color = isFast ? "#10b981" : isMedium ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs relative overflow-hidden h-full justify-between">
      <div className="text-center w-full mb-4">
        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
          {label}
        </h3>
        <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 m-0">
          {subLabel}
        </p>
      </div>

      <div className="relative mt-2" style={{ width: size, height: size / 2 }}>
        <svg
          width={size}
          height={size / 2}
          viewBox={`0 0 ${size} ${size / 2}`}
          className="overflow-visible"
        >
          {/* Background Arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${
              size - strokeWidth / 2
            } ${size / 2}`}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Foreground Arc */}
          <motion.path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${
              size - strokeWidth / 2
            } ${size / 2}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
          />
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span
            className="text-2xl font-extrabold tabular-nums"
            style={{ color }}
          >
            {days}
          </span>
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
            Days
          </span>
        </div>
      </div>

      <div className="w-full flex justify-between px-2 mt-4 text-[9px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
        <span>0 Days</span>
        <span>{maxDays}+ Days</span>
      </div>
    </div>
  );
}
