"use client";

import React from "react";
import { CORE_PILLARS } from "../constants/scenarios";

export function ArchitecturePillars() {
  return (
    <section id="pillars" className="mt-28">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-[11px] font-extrabold tracking-widest uppercase text-[var(--brand-600)]">
          Enterprise Engineering
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-2 mb-3">
          Built on uncompromising technical standards
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-tertiary)]">
          Designed from ground zero for maximum security, zero operational leakage, and seamless scalability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CORE_PILLARS.map((pillar, i) => {
          const Icon = pillar.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm hover-lift flex flex-col justify-between"
            >
              <div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${pillar.accent}`}>
                  <Icon className="w-5 h-5" strokeWidth={2.2} />
                </div>
                <h3 className="text-base font-extrabold text-[var(--text-primary)] mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
