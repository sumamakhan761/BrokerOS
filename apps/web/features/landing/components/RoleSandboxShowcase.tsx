"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { SCENARIOS, EASE_OUT_EXPO } from "../constants/scenarios";

export function RoleSandboxShowcase() {
  const [activeScenarioId, setActiveScenarioId] = useState("pre-sales");
  const activeScenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];

  return (
    <section id="sandbox" className="mt-28">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-[11px] font-extrabold tracking-widest uppercase text-[var(--brand-600)]">
          Interactive Workspace Sandbox
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-2 mb-3">
          Experience the platform through each stakeholder's eyes
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-tertiary)]">
          Click through the roles below to see how BrokerOS adapts its workflows, data visibility,
          and actions for every department.
        </p>
      </div>

      {/* Role Tab Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {SCENARIOS.map((scenario) => {
          const isActive = scenario.id === activeScenarioId;
          return (
            <button
              key={scenario.id}
              onClick={() => setActiveScenarioId(scenario.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.96] press-effect ${
                isActive
                  ? "bg-[var(--brand-600)] text-white shadow-md shadow-purple-600/20"
                  : "bg-white text-[var(--text-secondary)] border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {scenario.roleTitle}
            </button>
          );
        })}
      </div>

      {/* Sandbox Live Display Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeScenario.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
          className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden max-w-4xl mx-auto"
        >
          {/* Card Header Bar */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${activeScenario.badgeColor}`}
              >
                {activeScenario.badge}
              </span>
              <span className="text-xs font-extrabold text-[var(--text-primary)]">
                {activeScenario.roleTitle} Workspace
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-[var(--text-tertiary)]">
              <div>
                <span className="text-[var(--text-muted)]">{activeScenario.statPrimary.label}: </span>
                <strong className="text-[var(--text-primary)] tabular-nums">
                  {activeScenario.statPrimary.value}
                </strong>
                <span className="text-emerald-600 font-bold ml-1">
                  ({activeScenario.statPrimary.change})
                </span>
              </div>
            </div>
          </div>

          {/* Card Body Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Description */}
            <div className="md:col-span-5 flex flex-col justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)] mb-3 leading-snug">
                  {activeScenario.headline}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-tertiary)] leading-relaxed mb-6">
                  {activeScenario.summary}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
                <div className="text-[11px] font-bold text-[var(--brand-700)] uppercase tracking-wider mb-1">
                  Secondary Metric
                </div>
                <div className="text-xl font-extrabold text-[var(--text-primary)] tabular-nums">
                  {activeScenario.statSecondary.value}
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)]">
                  {activeScenario.statSecondary.label}
                </div>
              </div>
            </div>

            {/* Right Interactive Mock UI Component */}
            <div className="md:col-span-7 bg-slate-50/80 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-4">
                  <div className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--brand-600)]" />
                    {activeScenario.mockUi.title}
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[var(--text-secondary)]">
                    {activeScenario.mockUi.tag}
                  </span>
                </div>

                <div className="space-y-2.5 mb-6">
                  {activeScenario.mockUi.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-white border border-slate-100"
                    >
                      <span className="text-[var(--text-tertiary)] font-medium">{item.label}</span>
                      <span
                        className={`font-bold tabular-nums ${
                          item.highlight
                            ? "text-[var(--brand-700)] bg-purple-50 px-1.5 py-0.5 rounded"
                            : item.status === "success"
                            ? "text-emerald-700"
                            : item.status === "warning"
                            ? "text-amber-700"
                            : "text-[var(--text-primary)]"
                        }`}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] transition-all shadow-sm active:scale-[0.96] press-effect flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{activeScenario.mockUi.actionLabel}</span>
                </button>
                {activeScenario.mockUi.secondaryActionLabel && (
                  <button className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] bg-white border border-slate-200 hover:bg-slate-100 transition-all active:scale-[0.96] press-effect">
                    {activeScenario.mockUi.secondaryActionLabel}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
