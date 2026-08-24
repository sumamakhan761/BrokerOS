"use client";

import React from "react";
import {
  CheckCircle2,
  FileText,
  ShieldCheck,
  Key,
  Home,
  ArrowRight,
} from "lucide-react";
import { SectionHeader } from "./shared";

export function BookingFunnel({ bookingFunnel }: { bookingFunnel: any }) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="Booking Pipeline Funnel"
        subtitle="Cumulative deal progress — each stage includes all bookings at that stage or beyond."
      />
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs max-w-2xl">
        <div className="space-y-2.5">
          {[
            {
              label: "Confirmed Bookings",
              value: bookingFunnel.confirmed,
              icon: <CheckCircle2 className="text-slate-400 w-4 h-4" />,
              bg: "bg-slate-50 border-slate-100",
            },
            {
              label: "Documentation & Beyond",
              value: bookingFunnel.documentation,
              icon: <FileText className="text-blue-500 w-4 h-4" />,
              bg: "bg-blue-50/70 border-blue-100",
            },
            {
              label: "Loan / Agreement & Beyond",
              value: bookingFunnel.loanAgreement,
              icon: <ShieldCheck className="text-[var(--brand-600)] w-4 h-4" />,
              bg: "bg-purple-50/70 border-purple-100",
            },
            {
              label: "Possession Pending & Beyond",
              value: bookingFunnel.possession,
              icon: <Key className="text-amber-500 w-4 h-4" />,
              bg: "bg-amber-50/70 border-amber-100",
            },
            {
              label: "Handover Completed",
              value: bookingFunnel.handover,
              icon: <Home className="text-emerald-500 w-4 h-4" />,
              bg: "bg-emerald-50/70 border-emerald-100",
            },
          ].map((stage, i, arr) => (
            <div key={stage.label}>
              <div
                className={`flex items-center justify-between p-3.5 rounded-2xl border ${stage.bg}`}
              >
                <div className="flex items-center gap-2.5">
                  {stage.icon}
                  <span className="font-bold text-xs text-slate-800">
                    {stage.label}
                  </span>
                </div>
                <span className="text-lg font-black text-slate-900 tabular-nums">
                  {stage.value}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div className="flex justify-center -my-1 z-10">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
