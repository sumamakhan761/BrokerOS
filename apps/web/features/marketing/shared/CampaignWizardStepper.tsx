"use client";

import React from "react";
import { Check } from "lucide-react";

export interface WizardStepItem {
  num: number;
  label: string;
  desc: string;
}

interface CampaignWizardStepperProps {
  steps: WizardStepItem[];
  currentStep: number;
  onStepClick: (stepNum: number) => void;
  accentColor?: "purple" | "amber";
}

export function CampaignWizardStepper({
  steps,
  currentStep,
  onStepClick,
  accentColor = "purple",
}: CampaignWizardStepperProps) {
  const isPurple = accentColor === "purple";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      {steps.map((s) => {
        const isCurrent = currentStep === s.num;
        const isCompleted = currentStep > s.num;

        const activeClasses = isPurple
          ? "bg-purple-50/80 border-[var(--brand-500)] shadow-xs ring-2 ring-purple-500/15"
          : "bg-amber-50/80 border-amber-500 shadow-xs ring-2 ring-amber-500/15";

        const activeBadgeClasses = isPurple
          ? "bg-[var(--brand-600)] text-white shadow-xs"
          : "bg-amber-600 text-white shadow-xs";

        const activeTextClasses = isPurple
          ? "text-[var(--brand-900)]"
          : "text-amber-900";

        return (
          <button
            key={s.num}
            type="button"
            onClick={() => onStepClick(s.num)}
            className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 active:scale-[0.99] ${
              isCurrent
                ? activeClasses
                : isCompleted
                ? "bg-emerald-50/50 border-emerald-300/80 hover:bg-emerald-50"
                : "bg-slate-50/50 border-slate-200/80 hover:bg-slate-100/60"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0 transition-colors ${
                isCurrent
                  ? activeBadgeClasses
                  : isCompleted
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {isCompleted ? <Check className="w-4 h-4" strokeWidth={2.5} /> : s.num}
            </div>

            <div className="min-w-0 flex-1">
              <div
                className={`text-xs font-extrabold truncate ${
                  isCurrent
                    ? activeTextClasses
                    : isCompleted
                    ? "text-emerald-900"
                    : "text-[var(--text-primary)]"
                }`}
              >
                {s.label}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5 font-medium">
                {s.desc}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
