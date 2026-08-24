"use client";

import React from "react";
import { motion } from "framer-motion";

interface CircularPercentageProps {
  percentage: number;
  label: string;
  subLabel?: string;
  size?: number;
  strokeWidth?: number;
  color?: "primary" | "success" | "warning" | "danger";
  delay?: number;
}

export function CircularPercentage({
  percentage,
  label,
  subLabel,
  size = 180,
  strokeWidth = 14,
  color = "primary",
  delay = 0,
}: CircularPercentageProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (Math.min(percentage, 100) / 100) * circumference;

  const colorMap = {
    primary: {
      stroke: "#9333ea", // purple 600
      gradient: ["#a855f7", "#7e22ce"], // purple 500 to 700
      text: "text-purple-900",
    },
    success: {
      stroke: "#10b981", // emerald 500
      gradient: ["#34d399", "#059669"], // emerald 400 to 600
      text: "text-emerald-900",
    },
    warning: {
      stroke: "#f59e0b", // amber 500
      gradient: ["#fbbf24", "#d97706"], // amber 400 to 600
      text: "text-amber-900",
    },
    danger: {
      stroke: "#f43f5e", // rose 500
      gradient: ["#fb7185", "#e11d48"], // rose 400 to 600
      text: "text-rose-900",
    },
  };

  const selectedColor = colorMap[color];
  const gradientId = `circ-grad-${color}-${Math.random()
    .toString(36)
    .substring(7)}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="flex flex-col items-center justify-center"
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={selectedColor.gradient[0]} />
              <stop offset="100%" stopColor={selectedColor.gradient[1]} />
            </linearGradient>
          </defs>

          {/* Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress Indicator */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, delay: delay + 0.15, ease: "easeOut" }}
          />
        </svg>

        {/* Metric Counter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: delay + 0.5 }}
            className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tabular-nums tracking-tight"
          >
            {percentage}%
          </motion.span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <h4 className="text-xs font-bold text-[var(--text-primary)] m-0">
          {label}
        </h4>
        {subLabel && (
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 m-0 font-medium">
            {subLabel}
          </p>
        )}
      </div>
    </motion.div>
  );
}
