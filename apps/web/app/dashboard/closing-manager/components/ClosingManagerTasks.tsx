"use client";

import React, { useState } from "react";
import {
  ClipboardList,
  FileText,
  Banknote,
  Handshake,
  PhoneForwarded,
  ChevronRight,
  Key,
} from "lucide-react";
import Link from "next/link";

export function ClosingManagerTasks({ dashData }: { dashData: any }) {
  const [activeTab, setActiveTab] = useState<
    "DOCUMENTS" | "LOANS" | "AGREEMENTS" | "HANDOVERS" | "FOLLOW_UPS"
  >("DOCUMENTS");

  const lists = dashData?.lists || {};
  const documents = lists.documentPending || [];
  const loans = lists.loanPending || [];
  const agreements = lists.agreementPending || [];
  const handovers = lists.handoverPending || [];
  const followUps = lists.todayFollowups || [];

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs flex flex-col justify-between h-full mt-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <ClipboardList size={16} />
            </div>
            <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
              Pending Pipeline Milestones & Follow-ups
            </h2>
          </div>
        </div>
        <p className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5 mb-3 m-0">
          Manage deal closing tasks, loan sanctions, registration agreements and customer touchpoints
        </p>

        <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/60 w-fit mb-4 overflow-x-auto">
          {[
            {
              id: "DOCUMENTS",
              label: `Documents (${documents.length})`,
            },
            { id: "LOANS", label: `Loans (${loans.length})` },
            {
              id: "AGREEMENTS",
              label: `Agreements (${agreements.length})`,
            },
            {
              id: "HANDOVERS",
              label: `Handovers (${handovers.length})`,
            },
            {
              id: "FOLLOW_UPS",
              label: `Follow-ups (${followUps.length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-[var(--text-primary)] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="max-h-[460px] overflow-y-auto pr-1">
          {activeTab === "DOCUMENTS" && (
            <ListBookings
              items={documents}
              emptyMsg="No documents pending."
              iconColor="#9333ea"
              iconBg="bg-purple-50"
              borderAccent="border-purple-100"
              Icon={FileText}
            />
          )}
          {activeTab === "LOANS" && (
            <ListBookings
              items={loans}
              emptyMsg="No loans pending."
              iconColor="#3b82f6"
              iconBg="bg-blue-50"
              borderAccent="border-blue-100"
              Icon={Banknote}
            />
          )}
          {activeTab === "AGREEMENTS" && (
            <ListBookings
              items={agreements}
              emptyMsg="No agreements pending."
              iconColor="#9333ea"
              iconBg="bg-purple-50"
              borderAccent="border-purple-100"
              Icon={Handshake}
            />
          )}
          {activeTab === "HANDOVERS" && (
            <ListBookings
              items={handovers}
              emptyMsg="No handovers pending."
              iconColor="#f59e0b"
              iconBg="bg-amber-50"
              borderAccent="border-amber-100"
              Icon={Key}
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
    </div>
  );
}

function ListBookings({
  items,
  emptyMsg,
  iconColor,
  iconBg,
  borderAccent,
  Icon,
}: {
  items: any[];
  emptyMsg: string;
  iconColor: string;
  iconBg: string;
  borderAccent: string;
  Icon: any;
}) {
  if (items.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-xs font-semibold text-[var(--text-muted)] text-center gap-2">
        <Icon size={24} className="text-slate-300" />
        <span>{emptyMsg}</span>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((booking) => (
        <Link
          key={booking.id}
          href={
            booking.customer?.leadId
              ? `/dashboard/closing-manager/lead-management/${booking.customer.leadId}`
              : "#"
          }
          className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-100/60 transition-colors no-underline group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl ${iconBg} border ${borderAccent} flex items-center justify-center shrink-0`}
              style={{ color: iconColor }}
            >
              <Icon size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--brand-700)] transition-colors">
                {booking.customer?.firstName} {booking.customer?.lastName}
              </div>
              <div className="text-[10px] font-semibold text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                <span className="px-1.5 py-0.5 rounded bg-purple-50 text-[var(--brand-700)] font-extrabold uppercase tracking-wider text-[8px] border border-purple-200/60">
                  {booking.status.replace(/_/g, " ")}
                </span>
                <span>•</span>
                <span className="tabular-nums">
                  Unit: {booking.unit?.unitNumber || "N/A"}
                </span>
              </div>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400 shrink-0 group-hover:text-slate-600 transition-colors" />
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
      <div className="py-12 flex flex-col items-center justify-center text-xs font-semibold text-[var(--text-muted)] text-center gap-2">
        <PhoneForwarded size={24} className="text-slate-300" />
        <span>{emptyMsg}</span>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((fup) => (
        <Link
          key={fup.id}
          href={
            fup.customer?.leadId
              ? `/dashboard/closing-manager/lead-management/${fup.customer.leadId}`
              : "#"
          }
          className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-100/60 transition-colors no-underline group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
              <PhoneForwarded size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--brand-700)] transition-colors">
                {fup.customer?.firstName} {fup.customer?.lastName}
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
          <ChevronRight size={14} className="text-slate-400 shrink-0 group-hover:text-slate-600 transition-colors" />
        </Link>
      ))}
    </div>
  );
}
