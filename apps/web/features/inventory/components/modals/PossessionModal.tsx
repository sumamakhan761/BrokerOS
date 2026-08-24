import React, { useState } from "react";
import { X, Activity, Check, Calendar } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export type ConstructionStatus =
  | "NOT_STARTED"
  | "EXCAVATION"
  | "FOUNDATION"
  | "SUPER_STRUCTURE"
  | "BRICKWORK"
  | "PLASTERING"
  | "FINISHING"
  | "READY_FOR_POSSESSION"
  | "HANDOVER";

const statusLabels: Record<ConstructionStatus, string> = {
  NOT_STARTED: "Not Started",
  EXCAVATION: "Excavation",
  FOUNDATION: "Foundation & Basement",
  SUPER_STRUCTURE: "Super Structure",
  BRICKWORK: "Brickwork & Masonry",
  PLASTERING: "Plastering & Electrical",
  FINISHING: "Finishing & Interiors",
  READY_FOR_POSSESSION: "Ready for Possession (OC Received)",
  HANDOVER: "Keys Handover Stage",
};

interface PossessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: "project" | "tower" | "unit";
  entityName: string;
  initialStatus?: ConstructionStatus;
  initialTimeline?: { value: number; unit: "MONTHS" | "YEARS" };
  onSuccess: () => void;
}

export default function PossessionModal({
  isOpen,
  onClose,
  entityId,
  entityType,
  entityName,
  initialStatus,
  initialTimeline,
  onSuccess,
}: PossessionModalProps) {
  const [status, setStatus] = useState<ConstructionStatus>(
    initialStatus || "NOT_STARTED"
  );
  const [timeValue, setTimeValue] = useState(initialTimeline?.value || 1);
  const [timeUnit, setTimeUnit] = useState<"MONTHS" | "YEARS">(
    initialTimeline?.unit || "MONTHS"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

      const endpoint =
        entityType === "project"
          ? `/api/inventory/projects/${entityId}/possession`
          : entityType === "tower"
          ? `/api/inventory/towers/${entityId}/possession`
          : `/api/inventory/units/${entityId}/possession`;

      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          timeline: { value: timeValue, unit: timeUnit },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update possession details");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-enter">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-slate-200/80">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <Calendar size={16} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight m-0">
                Set Possession Timeline
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 m-0">
                Configuring for <span className="text-[var(--brand-700)] font-bold">{entityName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200">
            {error}
          </div>
        )}

        {(entityType === "project" || entityType === "tower") && (
          <div className="p-3.5 bg-amber-50 text-amber-900 rounded-xl text-xs border border-amber-200 flex gap-2.5 items-start">
            <Activity size={15} className="shrink-0 text-amber-700 mt-0.5" />
            <p className="m-0 leading-relaxed font-medium">
              <strong>Cascading notice:</strong> Setting timeline at the {entityType} level will update all underlying {entityType === "project" ? "towers and units" : "units"}.
            </p>
          </div>
        )}

        <div className="space-y-3.5">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Construction Status
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as ConstructionStatus)
              }
              className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500/15 focus:border-[var(--brand-600)] transition-all outline-none text-base sm:text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
            >
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Estimated Timeline Remaining
            </label>
            <div className="flex gap-2.5">
              <input
                type="number"
                min="0"
                value={timeValue}
                onChange={(e) =>
                  setTimeValue(parseInt(e.target.value) || 0)
                }
                className="flex-1 h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500/15 focus:border-[var(--brand-600)] transition-all outline-none text-base sm:text-xs font-semibold text-[var(--text-primary)] tabular-nums"
              />
              <select
                value={timeUnit}
                onChange={(e) =>
                  setTimeUnit(e.target.value as "MONTHS" | "YEARS")
                }
                className="w-28 h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500/15 focus:border-[var(--brand-600)] transition-all outline-none text-base sm:text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
              >
                <option value="MONTHS">Months</option>
                <option value="YEARS">Years</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.96] press-effect cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] rounded-xl shadow-xs transition-all active:scale-[0.96] press-effect disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check size={14} />
            )}
            <span>Save Timeline</span>
          </button>
        </div>
      </div>
    </div>
  );
}
