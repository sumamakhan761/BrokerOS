"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";
import { EASE_OUT_EXPO } from "../constants/scenarios";

export function LandingHero() {
  return (
    <>
      <div className="text-center max-w-3xl mx-auto">
        {/* Live System Pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-purple-200/80 shadow-xs mb-8 text-[11px] font-bold uppercase tracking-wider text-[var(--brand-700)]"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
          <span>Mission-Critical Real Estate Operating System</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: EASE_OUT_EXPO }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.08] mb-6 text-balance"
        >
          The Operating System Built for{" "}
          <span>Every Real Estate Role.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT_EXPO }}
          className="text-base sm:text-lg text-[var(--text-tertiary)] font-normal max-w-2xl mx-auto mb-10 leading-relaxed text-pretty"
        >
          Twelve deeply-crafted departmental dashboards, strict multi-factor RBAC,
          GPS-verified site visits, and automated commission settlements — completely
          partitioning internal sales from external channel partner networks.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: EASE_OUT_EXPO }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] shadow-lg shadow-purple-600/25 transition-all hover:shadow-xl hover:shadow-purple-600/30 active:scale-[0.96] press-effect"
          >
            <span>Access Your Workspace</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>

          <a
            href="#sandbox"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-[var(--text-secondary)] bg-white border border-[var(--border-default)] hover:bg-slate-50 shadow-xs transition-all active:scale-[0.96] press-effect"
          >
            <span>Explore Role Sandbox</span>
            <Compass className="w-4 h-4 text-purple-600" />
          </a>
        </motion.div>
      </div>

      {/* ── Key Metrics Bento Strip ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: EASE_OUT_EXPO }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-16 max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm hover-lift">
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--brand-600)] tabular-nums mb-1">
            12
          </div>
          <div className="text-xs font-bold text-[var(--text-primary)]">Role Workspaces</div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Pre-Sales to Director</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm hover-lift">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tabular-nums mb-1">
            100%
          </div>
          <div className="text-xs font-bold text-[var(--text-primary)]">RBAC Guarded</div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">No client-side elevation</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm hover-lift">
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 tabular-nums mb-1">
            2 Worlds
          </div>
          <div className="text-xs font-bold text-[var(--text-primary)]">Clean Partition</div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Single isCpProject flag</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm hover-lift">
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 tabular-nums mb-1">
            Real-Time
          </div>
          <div className="text-xs font-bold text-[var(--text-primary)]">Socket.io Engine</div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Live chat & alerts</div>
        </div>
      </motion.div>
    </>
  );
}
