'use client';

import React from 'react';
import { Card } from '@heroui/react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  delay?: number;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="h-full"
    >
      <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-3xl overflow-hidden relative group">
        <div className="absolute -right-6 -top-6 w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none" />
        <div className="p-5 relative z-10">
          <div className="flex justify-between items-start gap-3">
            <div className="flex flex-col gap-0.5">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</p>
              <h4 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">{value}</h4>
              {subtitle && <p className="text-[11px] font-medium text-slate-400 mt-0.5">{subtitle}</p>}

              {trend && trendValue && (
                <div className="flex items-center mt-3 gap-1.5 bg-slate-100/50 dark:bg-slate-800/50 w-fit px-2 py-0.5 rounded-md">
                  <span
                    className={`text-[10px] font-bold ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-slate-500'
                      }`}
                  >
                    {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
                  </span>
                </div>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <Icon size={20} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
