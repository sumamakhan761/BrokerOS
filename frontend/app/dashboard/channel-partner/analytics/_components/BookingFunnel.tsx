import React from "react";
import { CheckCircle2, FileText, ShieldCheck, Key, Home, ArrowRight } from "lucide-react";
import { SectionHeader } from "./shared";

export function BookingFunnel({ bookingFunnel }: { bookingFunnel: any }) {
  return (
    <section>
      <SectionHeader title="Booking Pipeline Funnel" subtitle="Cumulative progress — each stage includes all bookings at that stage or beyond." />
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm max-w-2xl">
        <div className="flex flex-col gap-3">
          {[
            { label: "Confirmed Bookings", value: bookingFunnel.confirmed, icon: <CheckCircle2 className="text-slate-500 w-5 h-5" />, bg: "bg-slate-50 border-slate-100" },
            { label: "Documentation & Beyond", value: bookingFunnel.documentation, icon: <FileText className="text-blue-500 w-5 h-5" />, bg: "bg-blue-50 border-blue-100" },
            { label: "Loan / Agreement & Beyond", value: bookingFunnel.loanAgreement, icon: <ShieldCheck className="text-indigo-500 w-5 h-5" />, bg: "bg-indigo-50 border-indigo-100" },
            { label: "Possession Pending & Beyond", value: bookingFunnel.possession, icon: <Key className="text-amber-500 w-5 h-5" />, bg: "bg-amber-50 border-amber-100" },
            { label: "Handover Completed", value: bookingFunnel.handover, icon: <Home className="text-emerald-500 w-5 h-5" />, bg: "bg-emerald-50 border-emerald-100" },
          ].map((stage, i, arr) => (
            <div key={stage.label}>
              <div className={`flex items-center justify-between p-4 rounded-2xl border ${stage.bg}`}>
                <div className="flex items-center gap-3">{stage.icon}<span className="font-semibold text-slate-700">{stage.label}</span></div>
                <span className="text-xl font-black text-slate-900">{stage.value}</span>
              </div>
              {i < arr.length - 1 && <div className="flex justify-center my-1"><ArrowRight className="w-4 h-4 text-slate-300 rotate-90" /></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
