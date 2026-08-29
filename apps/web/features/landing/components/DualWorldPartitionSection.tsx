"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export function DualWorldPartitionSection() {
  return (
    <>
      {/* ── The Two-World Partition Spotlight ───────────────────────── */}
      <section id="security" className="mt-28 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-md">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-purple-50 text-[var(--brand-700)] border border-purple-200">
            Core Architectural Invariant
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-4 mb-3">
            Two Complete Business Lines. One Clean Flag.
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-tertiary)] leading-relaxed">
            BrokerOS runs both internal sales operations and external broker networks under one roof,
            strictly segregated by <code className="px-1.5 py-0.5 rounded bg-slate-100 text-purple-700 font-mono text-xs font-bold">Project.isCpProject</code>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* World 1: Internal Brokerage */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2.5 py-1 rounded-lg">
                  Internal Sales
                </span>
                <code className="text-[11px] font-mono font-bold text-slate-500">isCpProject = false</code>
              </div>
              <h4 className="text-base font-bold text-[var(--text-primary)] mb-2">
                Direct In-House Sales Team
              </h4>
              <ul className="space-y-2 text-xs text-[var(--text-tertiary)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                  <span>Pre-Sales lead triage & daily manager quotas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                  <span>Sales Executive on-site GPS verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                  <span>Customer handovers & inbound builder commissions</span>
                </li>
              </ul>
            </div>
          </div>

          {/* World 2: Channel Partner */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2.5 py-1 rounded-lg">
                  Channel Partner Network
                </span>
                <code className="text-[11px] font-mono font-bold text-slate-500">isCpProject = true</code>
              </div>
              <h4 className="text-base font-bold text-[var(--text-primary)] mb-2">
                External Real Estate Broker Network
              </h4>
              <ul className="space-y-2 text-xs text-[var(--text-tertiary)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span>Sourcing & Closing Manager broker allocations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span>Multi-tiered brokerage payout calculations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span>Zero data cross-leakage into direct sales inventory</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ready to Launch CTA Banner ──────────────────────────────── */}
      <section className="mt-28 text-center bg-gradient-to-br from-[var(--brand-700)] to-indigo-950 rounded-3xl p-10 sm:p-14 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Ready to streamline your entire brokerage?
          </h2>
          <p className="text-xs sm:text-sm text-purple-200 mb-8 leading-relaxed">
            Experience the power of a bespoke real estate operating system engineered for scale,
            governance, and velocity.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold text-[var(--brand-900)] bg-white hover:bg-purple-50 shadow-xl transition-all active:scale-[0.96] press-effect"
          >
            <span>Access Your Portal</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </div>
      </section>
    </>
  );
}
