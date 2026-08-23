import React from "react";
import { EmployeeDashboardData } from "./types";
import { Sparkles, ClipboardList, AlertTriangle, MapPin, Trophy } from "lucide-react";

export function EmployeeWidgets({ widgets }: { widgets: EmployeeDashboardData["widgets"] }) {
  const cards = [
    { label: "New Leads", value: widgets.newLeads, icon: <Sparkles className="w-5 h-5 text-indigo-500" />, accentClass: "bg-indigo-50 text-indigo-500", glowClass: "from-indigo-500/10" },
    { label: "Today's Follow-ups", value: widgets.todayFollowUps, icon: <ClipboardList className="w-5 h-5 text-emerald-500" />, accentClass: "bg-emerald-50 text-emerald-500", glowClass: "from-emerald-500/10" },
    { label: "Missed Follow-ups", value: widgets.missedFollowUps, icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, accentClass: "bg-amber-50 text-amber-500", glowClass: "from-amber-500/10" },
    { label: "Site Visits", value: widgets.siteVisitsScheduled, icon: <MapPin className="w-5 h-5 text-purple-500" />, accentClass: "bg-purple-50 text-purple-500", glowClass: "from-purple-500/10" },
    { label: "Bookings", value: widgets.bookingsGenerated, icon: <Trophy className="w-5 h-5 text-pink-500" />, accentClass: "bg-pink-50 text-pink-500", glowClass: "from-pink-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
      {cards.map((w, i) => (
        <div key={w.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group animate-[fadeUp_0.4s_ease_forwards]" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${w.glowClass} to-transparent opacity-50 rounded-bl-full`} />
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${w.accentClass}`}>
            {w.icon}
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">{w.value}</div>
          <div className="text-sm font-semibold text-slate-500">{w.label}</div>
        </div>
      ))}
    </div>
  );
}
