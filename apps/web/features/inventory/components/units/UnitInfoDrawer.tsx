"use client";

import React from "react";
import { X, Lock, Info } from "lucide-react";

interface UnitInfoDrawerProps {
  unit: any;
  isOpen: boolean;
  onClose: () => void;
}

export function UnitInfoDrawer({ unit, isOpen, onClose }: UnitInfoDrawerProps) {
  if (!isOpen || !unit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-enter">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-slate-200/80">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight m-0">
              Unit {unit.unitNumber}
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 m-0 tabular-nums">
              Floor {unit.floor?.floorNumber || "—"} • {unit.type.replace("_", " ")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
              Current Status
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                unit.status === "RESERVED"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : unit.status === "SOLD"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <Lock size={12} />
              <span>{unit.status}</span>
            </span>
          </div>

          {/* Grid Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider block mb-0.5">
                Type
              </span>
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {unit.type.replace("_", " ")}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider block mb-0.5">
                Facing
              </span>
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {unit.facing || "N/A"}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider block mb-0.5">
                Carpet Area
              </span>
              <span className="text-xs font-bold text-[var(--text-primary)] tabular-nums">
                {unit.carpetArea} sqft
              </span>
            </div>
            <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200/80">
              <span className="text-[10px] text-purple-800 font-extrabold uppercase tracking-wider block mb-0.5">
                Base Price
              </span>
              <span className="text-xs font-extrabold text-purple-950 tabular-nums">
                ₹{Number(unit.basePrice || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Lock notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-2.5 items-start text-xs text-amber-900">
            <Info size={15} className="text-amber-700 shrink-0 mt-0.5" />
            <p className="m-0 leading-relaxed font-medium">
              This inventory unit is currently locked and cannot be booked directly. Contact your Sales Manager to request allocation or status release.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.96] press-effect cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
