"use client";

import React, { useState } from "react";
import {
  ClipboardList,
  Calendar,
  PhoneForwarded,
  ChevronRight,
} from "lucide-react";

export function SourcingManagerTasks({ dashData }: { dashData: any }) {
  const [activeTab, setActiveTab] = useState<"MEETINGS" | "FOLLOW_UPS">(
    "MEETINGS"
  );

  const todayMeetings = dashData.todayMeetingList || [];
  const followUps = dashData.todayFollowUpList || [];

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <ClipboardList size={16} />
            </div>
            <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
              Daily Partner Tasks
            </h2>
          </div>
        </div>
        <p className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5 mb-3 m-0">
          Scheduled meetings and broker check-ins for today
        </p>

        <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/60 w-fit mb-4">
          {[
            {
              id: "MEETINGS",
              label: `Meetings (${todayMeetings.length})`,
            },
            {
              id: "FOLLOW_UPS",
              label: `Follow-ups (${followUps.length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-[var(--text-primary)] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="max-h-[380px] overflow-y-auto pr-1">
          {activeTab === "MEETINGS" && (
            <ListMeetings
              items={todayMeetings}
              emptyMsg="No broker meetings scheduled for today."
            />
          )}
          {activeTab === "FOLLOW_UPS" && (
            <ListFollowUps
              items={followUps}
              emptyMsg="No broker follow-ups scheduled for today."
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ListMeetings({
  items,
  emptyMsg,
}: {
  items: any[];
  emptyMsg: string;
}) {
  if (items.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-xs font-semibold text-[var(--text-muted)] text-center gap-2">
        <Calendar size={24} className="text-slate-300" />
        <span>{emptyMsg}</span>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((meeting) => (
        <div
          key={meeting.id}
          className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-100/60 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 text-[var(--brand-700)]">
              <Calendar size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                Broker: {meeting.broker?.name || "Unknown"}
              </div>
              <div className="text-[10px] font-semibold text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold uppercase tracking-wider text-[8px] border border-emerald-200/60">
                  Scheduled
                </span>
                <span>•</span>
                <span className="tabular-nums">
                  {new Date(meeting.scheduledDate).toLocaleString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400 shrink-0" />
        </div>
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
      <div className="py-12 flex flex-col items-center justify-center text-xs font-semibold text-[var(--text-muted)] text-center gap-2">
        <PhoneForwarded size={24} className="text-slate-300" />
        <span>{emptyMsg}</span>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((fup) => (
        <div
          key={fup.id}
          className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-100/60 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
              <PhoneForwarded size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                Broker: {fup.broker?.name || "Unknown"}
              </div>
              <div className="text-[10px] font-semibold text-[var(--text-muted)] mt-0.5 tabular-nums">
                Scheduled:{" "}
                {new Date(fup.scheduledDate).toLocaleString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400 shrink-0" />
        </div>
      ))}
    </div>
  );
}
