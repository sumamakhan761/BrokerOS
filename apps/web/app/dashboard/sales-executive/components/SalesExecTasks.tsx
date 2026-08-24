"use client";

import React, { useState } from "react";
import { DashboardData } from "../types";
import {
  ClipboardList,
  MapPin,
  PhoneForwarded,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export function SalesExecTasks({ dashData }: { dashData: DashboardData }) {
  const [activeTab, setActiveTab] = useState<
    "TODAY_SV" | "BACKLOG_SV" | "FOLLOW_UPS"
  >("TODAY_SV");

  const todaySVs = dashData.todaySiteVisitList || [];
  const backlogSVs = dashData.backlogSiteVisitList || [];
  const followUps = [
    ...(dashData.missedFollowUpBacklog || []),
    ...(dashData.todayFollowUpList || []),
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xs flex flex-col h-full overflow-hidden animate-enter">
      <div className="p-5 pb-0">
        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2 m-0">
          <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
            <ClipboardList size={14} />
          </div>
          <span>Daily Tasks & Backlog</span>
        </h3>
        <p className="text-[11px] font-medium text-[var(--text-muted)] mt-1 m-0">
          Actionable site visits & scheduled follow-ups
        </p>
      </div>

      <div className="flex px-5 pt-4 gap-4 border-b border-slate-100 overflow-x-auto no-scrollbar">
        {[
          {
            id: "TODAY_SV",
            label: `Today's SVs (${todaySVs.length})`,
            activeClass: "text-[var(--brand-700)] border-[var(--brand-600)]",
          },
          {
            id: "BACKLOG_SV",
            label: `SV Backlog (${backlogSVs.length})`,
            activeClass: "text-rose-700 border-rose-600",
          },
          {
            id: "FOLLOW_UPS",
            label: `Follow-ups (${followUps.length})`,
            activeClass: "text-emerald-700 border-emerald-600",
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2.5 text-xs font-bold whitespace-nowrap bg-transparent border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? tab.activeClass
                : "text-slate-400 border-transparent hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-h-[380px] space-y-2">
        {activeTab === "TODAY_SV" && (
          <ListSVs
            items={todaySVs}
            emptyMsg="No site visits scheduled for today."
            iconColor="text-[var(--brand-700)]"
            iconBg="bg-purple-50 border-purple-200"
          />
        )}
        {activeTab === "BACKLOG_SV" && (
          <ListSVs
            items={backlogSVs}
            emptyMsg="No backlog site visits. Great job!"
            isBacklog
            iconColor="text-rose-600"
            iconBg="bg-rose-50 border-rose-200"
          />
        )}
        {activeTab === "FOLLOW_UPS" && (
          <ListFollowUps
            items={followUps}
            emptyMsg="No follow-ups scheduled for today."
          />
        )}
      </div>
    </div>
  );
}

function ListSVs({
  items,
  emptyMsg,
  isBacklog = false,
  iconColor,
  iconBg,
}: {
  items: any[];
  emptyMsg: string;
  isBacklog?: boolean;
  iconColor: string;
  iconBg: string;
}) {
  if (items.length === 0) {
    return (
      <div className="text-xs font-medium text-slate-400 text-center py-8 flex flex-col items-center gap-2">
        <MapPin size={24} className="opacity-40" />
        <span>{emptyMsg}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {items.map((sv) => (
        <Link
          href={`/dashboard/sales-executive/lead-management/${sv.lead.id}`}
          key={sv.id}
          className="flex items-center justify-between p-3 border border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/80 rounded-2xl transition-all group no-underline"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${iconBg}`}
            >
              <MapPin size={16} className={iconColor} />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>
                  {sv.lead.firstName} {sv.lead.lastName}
                </span>
                {isBacklog && (
                  <span className="flex items-center gap-1 text-[9px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <AlertCircle size={10} /> Missed
                  </span>
                )}
              </div>
              <div className="text-[11px] font-semibold text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5 tabular-nums">
                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md text-[9px] uppercase tracking-wider font-extrabold">
                  {sv.project?.name || "Project"}
                </span>
                <span>•</span>
                <span>
                  {new Date(sv.scheduledDate).toLocaleString([], {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-[var(--brand-700)] group-hover:bg-purple-50 transition-colors">
            <ChevronRight size={16} />
          </div>
        </Link>
      ))}
    </div>
  );
}

function ListFollowUps({
  items,
  emptyMsg,
}: {
  items: any[];
  emptyMsg: string;
}) {
  if (items.length === 0) {
    return (
      <div className="text-xs font-medium text-slate-400 text-center py-8 flex flex-col items-center gap-2">
        <PhoneForwarded size={24} className="opacity-40" />
        <span>{emptyMsg}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {items.map((fup) => (
        <Link
          href={`/dashboard/sales-executive/lead-management/${fup.lead.id}`}
          key={fup.id}
          className="flex items-center justify-between p-3 border border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/80 rounded-2xl transition-all group no-underline"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <PhoneForwarded size={16} className="text-emerald-700" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>
                  {fup.lead.firstName} {fup.lead.lastName}
                </span>
                {fup.status === "MISSED" && (
                  <span className="flex items-center gap-1 text-[9px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <AlertCircle size={10} /> Missed
                  </span>
                )}
              </div>
              <div className="text-[11px] font-semibold text-[var(--text-muted)] mt-0.5 tabular-nums">
                Scheduled:{" "}
                {new Date(fup.scheduledDate).toLocaleString([], {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-[var(--brand-700)] group-hover:bg-purple-50 transition-colors">
            <ChevronRight size={16} />
          </div>
        </Link>
      ))}
    </div>
  );
}
