"use client";

import { Calendar, PhoneCall, AlertCircle, ArrowRight, Key } from "lucide-react";
import Link from "next/link";

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(dateString));
}

export function CPActionTasks({ tasks }: { tasks: any[] }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center min-h-[260px] text-center">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 border border-slate-100">
          <AlertCircle size={24} className="text-slate-400" />
        </div>
        <h3 className="text-sm font-extrabold text-[var(--text-primary)] m-0">
          All Caught Up!
        </h3>
        <p className="text-xs text-[var(--text-muted)] font-medium mt-1 max-w-sm m-0">
          No pending follow-ups, site visits, or handovers in your channel partner network.
        </p>
      </div>
    );
  }

  const getIconData = (type: string) => {
    switch (type) {
      case "SITE_VISIT":
        return {
          icon: Calendar,
          color: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-100",
        };
      case "FOLLOW_UP":
        return {
          icon: PhoneCall,
          color: "text-amber-600",
          bg: "bg-amber-50",
          border: "border-amber-100",
        };
      case "HANDOVER":
        return {
          icon: Key,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          border: "border-emerald-100",
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-slate-600",
          bg: "bg-slate-50",
          border: "border-slate-100",
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
          Broker Network Action Feed
        </h2>
        <span className="bg-purple-50 text-[var(--brand-700)] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-purple-200/60 tabular-nums">
          {tasks.length} Pending
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
        {tasks.map((task) => {
          const { icon: Icon, color, bg, border } = getIconData(task.type);
          const linkHref = task.leadId
            ? `/dashboard/channel-partner/customer-management/${task.leadId}`
            : task.brokerId
            ? `/dashboard/channel-partner/broker-management/${task.brokerId}`
            : "#";
          return (
            <div
              key={task.id}
              className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50/50 hover:bg-slate-100/60 border border-slate-100 transition-all group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl ${bg} ${border} border flex items-center justify-center shrink-0 ${color}`}
                >
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs text-[var(--text-primary)] truncate block group-hover:text-[var(--brand-700)] transition-colors">
                    {task.title}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-semibold mt-0.5 block tabular-nums">
                    {formatDate(task.date)}
                  </span>
                  {task.metadata && task.metadata.project && (
                    <span className="text-[9px] text-[var(--brand-700)] font-extrabold mt-1.5 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60 inline-block uppercase tracking-wider">
                      {task.metadata.project}
                    </span>
                  )}
                </div>
              </div>
              <Link
                href={linkHref}
                className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-400 hover:text-[var(--brand-700)] hover:border-purple-200 hover:bg-purple-50 transition-all shrink-0 no-underline shadow-2xs"
              >
                <ArrowRight size={13} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
