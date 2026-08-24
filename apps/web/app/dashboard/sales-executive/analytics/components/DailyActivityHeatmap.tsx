"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

export function DailyActivityHeatmap({
  activityData,
}: {
  activityData: any[];
}) {
  const [mode, setMode] = useState<"siteVisits" | "followUps">("siteVisits");

  if (!activityData) return null;

  // Generate last 90 days grid
  const days = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }

  const activityMap = new Map();
  activityData.forEach((d) => {
    activityMap.set(d.date, d);
  });

  const getColor = (count: number) => {
    if (count === 0) return "bg-slate-100";

    if (mode === "siteVisits") {
      if (count === 1) return "bg-purple-200";
      if (count === 2) return "bg-purple-400";
      if (count >= 3) return "bg-purple-600";
    } else {
      if (count <= 2) return "bg-emerald-200";
      if (count <= 5) return "bg-emerald-400";
      if (count > 5) return "bg-emerald-600";
    }
    return "bg-slate-100";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.25 }}
      className="bg-white p-6 rounded-3xl shadow-2xs border border-slate-200/80 mb-6 space-y-4"
    >
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2 m-0">
            <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <Calendar size={13} />
            </div>
            <span>Daily Execution Consistency (Last 90 Days)</span>
          </h3>
          <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 m-0">
            Activity footprint across field visits & client phone calls
          </p>
        </div>

        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setMode("siteVisits")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === "siteVisits"
                ? "bg-white text-[var(--brand-700)] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Site Visits
          </button>
          <button
            onClick={() => setMode("followUps")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === "followUps"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Follow-ups
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 justify-end">
        {days.map((day) => {
          const data = activityMap.get(day);
          const count = data ? data[mode] : 0;
          return (
            <div
              key={day}
              title={`${day}: ${count} ${
                mode === "siteVisits" ? "Site Visits" : "Follow-ups"
              }`}
              className={`w-3.5 h-3.5 rounded-sm transition-colors cursor-help ${getColor(
                count
              )}`}
            />
          );
        })}
      </div>

      <div className="flex justify-end items-center gap-2 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-slate-100" />
          <div
            className={`w-2.5 h-2.5 rounded-sm ${
              mode === "siteVisits" ? "bg-purple-200" : "bg-emerald-200"
            }`}
          />
          <div
            className={`w-2.5 h-2.5 rounded-sm ${
              mode === "siteVisits" ? "bg-purple-400" : "bg-emerald-400"
            }`}
          />
          <div
            className={`w-2.5 h-2.5 rounded-sm ${
              mode === "siteVisits" ? "bg-purple-600" : "bg-emerald-600"
            }`}
          />
        </div>
        <span>More</span>
      </div>
    </motion.div>
  );
}
