"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="h-full"
    >
      <div className="h-full bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-200 rounded-3xl p-5 relative group overflow-hidden">
        <div className="flex justify-between items-start gap-3">
          <div className="flex flex-col">
            <p className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider m-0">
              {title}
            </p>
            <h4 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mt-1 mb-0 tabular-nums">
              {value}
            </h4>
            {subtitle && (
              <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 m-0">
                {subtitle}
              </p>
            )}

            {trend && trendValue && (
              <div className="flex items-center mt-3 gap-1 w-fit px-2 py-0.5 rounded-full border text-[10px] font-extrabold">
                {trend === "up" ? (
                  <span className="text-emerald-700 bg-emerald-50 border-emerald-200 px-2 py-0.5 rounded-full">
                    ↑ {trendValue}
                  </span>
                ) : trend === "down" ? (
                  <span className="text-rose-700 bg-rose-50 border-rose-200 px-2 py-0.5 rounded-full">
                    ↓ {trendValue}
                  </span>
                ) : (
                  <span className="text-slate-700 bg-slate-100 border-slate-200 px-2 py-0.5 rounded-full">
                    → {trendValue}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)] border border-purple-200/60 shrink-0">
            <Icon size={18} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
