'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CircularPercentageProps {
  percentage: number;
  label: string;
  subLabel?: string;
  size?: number;
  strokeWidth?: number;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  delay?: number;
}

export function CircularPercentage({
  percentage,
  label,
  subLabel,
  size = 180,
  strokeWidth = 16,
  color = 'primary',
  delay = 0,
}: CircularPercentageProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    primary: {
      stroke: '#6366F1', // Indigo 500
      gradient: ['#818CF8', '#4F46E5'], // Indigo 400 to 600
    },
    success: {
      stroke: '#10B981', // Emerald 500
      gradient: ['#34D399', '#059669'], // Emerald 400 to 600
    },
    warning: {
      stroke: '#F59E0B', // Amber 500
      gradient: ['#FBBF24', '#D97706'], // Amber 400 to 600
    },
    danger: {
      stroke: '#F43F5E', // Rose 500
      gradient: ['#FB7185', '#E11D48'], // Rose 400 to 600
    },
  };

  const selectedColor = colorMap[color];
  const gradientId = `gradient-${color}-${Math.random().toString(36).substring(7)}`;
  const glowId = `glow-${color}-${Math.random().toString(36).substring(7)}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay, type: 'spring', bounce: 0.4 }}
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
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={selectedColor.gradient[0]} />
              <stop offset="100%" stopColor={selectedColor.gradient[1]} />
            </linearGradient>
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={selectedColor.stroke} floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F1F5F9" // slate-100
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress Circle */}
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
            transition={{ duration: 1.5, delay: delay + 0.2, ease: 'easeOut' }}
            filter={`url(#${glowId})`}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.8 }}
            className="text-3xl font-bold text-default-900"
          >
            {percentage}%
          </motion.span>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <h4 className="text-sm font-semibold text-default-700">{label}</h4>
        {subLabel && <p className="text-xs text-default-400 mt-1">{subLabel}</p>}
      </div>
    </motion.div>
  );
}
