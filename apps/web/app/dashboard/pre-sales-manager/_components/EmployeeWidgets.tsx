"use client";

import React from "react";
import { EmployeeDashboardData } from "./types";
import {
  Sparkles,
  ClipboardList,
  AlertTriangle,
  MapPin,
  Trophy,
} from "lucide-react";

export function EmployeeWidgets({
  widgets,
}: {
  widgets: EmployeeDashboardData["widgets"];
}) {
  const cards = [
    {
      label: "New Leads",
      value: widgets.newLeads,
      icon: Sparkles,
      color: "text-[var(--brand-700)] bg-purple-50 border-purple-200",
    },
    {
      label: "Today's Follow-ups",
      value: widgets.todayFollowUps,
      icon: ClipboardList,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Missed Follow-ups",
      value: widgets.missedFollowUps,
      icon: AlertTriangle,
      color: "text-amber-700 bg-amber-50 border-amber-200",
    },
    {
      label: "Site Visits",
      value: widgets.siteVisitsScheduled,
      icon: MapPin,
      color: "text-indigo-700 bg-indigo-50 border-indigo-200",
    },
    {
      label: "Bookings",
      value: widgets.bookingsGenerated,
      icon: Trophy,
      color: "text-rose-700 bg-rose-50 border-rose-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {cards.map((w) => {
        const Icon = w.icon;
        return (
          <div
            key={w.label}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all relative overflow-hidden group"
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                  {w.label}
                </span>
                <span className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight tabular-nums mt-1">
                  {w.value}
                </span>
              </div>
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center border shadow-2xs shrink-0 ${w.color}`}
              >
                <Icon size={16} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
