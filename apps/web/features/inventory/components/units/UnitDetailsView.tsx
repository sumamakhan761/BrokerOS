import React from "react";
import { Lock, CheckCircle2 } from "lucide-react";

interface UnitDetailsViewProps {
  unit: any;
  setPossessionModalOpen: (open: boolean) => void;
  readOnly?: boolean;
}

export function UnitDetailsView({
  unit,
  setPossessionModalOpen,
  readOnly,
}: UnitDetailsViewProps) {
  const commAmount =
    unit.basePrice && unit.commissionPercentage
      ? (Number(unit.basePrice) * Number(unit.commissionPercentage)) / 100
      : 0;

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
          Current Inventory Status
        </span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
            unit.status === "AVAILABLE"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : unit.status === "RESERVED"
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : unit.status === "SOLD"
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          {unit.status === "AVAILABLE" ? (
            <CheckCircle2 size={12} />
          ) : (
            <Lock size={12} />
          )}
          <span>{unit.status}</span>
        </span>
      </div>

      {/* Grid Details */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <span className="text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider block mb-0.5">
            Unit Type
          </span>
          <span className="text-xs font-bold text-[var(--text-primary)]">
            {unit.type.replace("_", " ")}
          </span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <span className="text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider block mb-0.5">
            Facing Direction
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
            Base List Price
          </span>
          <span className="text-xs font-extrabold text-purple-950 tabular-nums">
            ₹{Number(unit.basePrice || 0).toLocaleString("en-IN")}
          </span>
        </div>

        <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 col-span-2">
          <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider block mb-0.5">
            Brokerage Terms
          </span>
          <span className="text-xs font-extrabold text-emerald-950 tabular-nums">
            {unit.commissionPercentage || 0}%{" "}
            <span className="text-[11px] font-bold text-emerald-700">
              (₹{commAmount.toLocaleString("en-IN")})
            </span>
          </span>
        </div>

        {/* Possession Info */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 col-span-2 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider block mb-0.5">
              Possession Status & Timeline
            </span>
            <span className="text-xs font-bold text-[var(--text-primary)]">
              {unit.constructionStatus
                ? `${unit.constructionStatus.replace(/_/g, " ")} (${
                    unit.possessionTimeline?.value || 0
                  } ${unit.possessionTimeline?.unit || "MONTHS"})`
                : "Inherited from Tower/Project"}
            </span>
          </div>
          {!readOnly && (
            <button
              onClick={() => setPossessionModalOpen(true)}
              className="px-2.5 py-1 text-[11px] font-bold bg-white text-[var(--brand-700)] hover:bg-purple-50 rounded-lg transition-colors border border-purple-200 cursor-pointer shadow-2xs"
            >
              Override
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
