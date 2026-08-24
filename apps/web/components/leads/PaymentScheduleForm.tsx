"use client";

import React, { useState } from "react";
import { CreditCard, Calendar, Percent, Hash, Loader2 } from "lucide-react";

interface PaymentScheduleFormProps {
  bookingId: string;
  netAmount: number;
  agreedPrice: number;
  bookingAmount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentScheduleForm({
  bookingId,
  netAmount,
  agreedPrice,
  bookingAmount,
  onSuccess,
  onCancel,
}: PaymentScheduleFormProps) {
  const [scheduleMode, setScheduleMode] = useState<"months" | "percentage">(
    "months"
  );
  const [installments, setInstallments] = useState("12");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [percentagePerMonth, setPercentagePerMonth] = useState("5");
  const [startDate, setStartDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const calcPercentagePreview = () => {
    const pct = parseFloat(percentagePerMonth);
    if (!pct || pct <= 0 || netAmount <= 0) return null;
    const monthlyAmt = (pct / 100) * netAmount;
    const fullMonths = Math.floor(netAmount / monthlyAmt);
    const remainder = parseFloat(
      (netAmount - fullMonths * monthlyAmt).toFixed(2)
    );
    return {
      monthlyAmount: monthlyAmt.toFixed(2),
      totalMonths: remainder > 0 ? fullMonths + 1 : fullMonths,
      lastAmount:
        remainder > 0 ? remainder.toFixed(2) : monthlyAmt.toFixed(2),
      hasRemainder: remainder > 0,
    };
  };

  const preview =
    scheduleMode === "percentage" ? calcPercentagePreview() : null;

  const handleCreateSchedule = async () => {
    setCreating(true);
    setCreateError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

      const body: any = {
        netAmount,
        startDate: startDate || new Date().toISOString(),
      };

      if (scheduleMode === "months") {
        body.installmentsCount = parseInt(installments, 10);
        body.frequency = frequency;
      } else {
        body.percentagePerMonth = parseFloat(percentagePerMonth);
      }

      const res = await fetch(`${apiUrl}/api/payments/schedule/${bookingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const err = await res.json().catch(() => ({}));
        setCreateError(
          err.message || "Failed to create schedule. Please try again."
        );
      }
    } catch (error) {
      console.error(error);
      setCreateError("Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto animate-enter">
      {/* Net Amount Banner */}
      <div className="bg-purple-50/80 border border-purple-200/80 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
        <div>
          <p className="text-[10px] font-extrabold text-[var(--brand-700)] uppercase tracking-wider m-0">
            Total Net Balance
          </p>
          <p className="text-xl font-extrabold text-purple-950 tabular-nums m-0">
            ₹{netAmount.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-[var(--brand-700)] mt-0.5 m-0 font-semibold tabular-nums">
            ₹{agreedPrice.toLocaleString("en-IN")} − ₹{bookingAmount.toLocaleString("en-IN")} booking token
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-purple-100/70 flex items-center justify-center text-[var(--brand-700)]">
          <CreditCard size={18} />
        </div>
      </div>

      {/* Mode Toggle */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
          Milestone Distribution Method
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setScheduleMode("months")}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              scheduleMode === "months"
                ? "border-[var(--brand-600)] bg-purple-50 text-[var(--brand-700)] shadow-2xs"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Hash size={14} />
            <span>Fixed Installments</span>
          </button>
          <button
            type="button"
            onClick={() => setScheduleMode("percentage")}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              scheduleMode === "percentage"
                ? "border-[var(--brand-600)] bg-purple-50 text-[var(--brand-700)] shadow-2xs"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Percent size={14} />
            <span>% Rate / Month</span>
          </button>
        </div>
      </div>

      {/* Mode 1 – Fixed Months */}
      {scheduleMode === "months" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Number of Months
            </label>
            <input
              type="number"
              min="1"
              value={installments}
              onChange={(e) => setInstallments(e.target.value)}
              className="w-full h-9 px-3 text-base sm:text-xs font-semibold bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
            />
            {installments && netAmount > 0 && (
              <p className="text-[10px] text-[var(--text-muted)] mt-1 font-semibold tabular-nums m-0">
                ≈ ₹{(netAmount / parseInt(installments || "1", 10)).toLocaleString("en-IN", { maximumFractionDigits: 0 })} / mo
              </p>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full h-9 px-3 text-base sm:text-xs font-semibold bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
            </select>
          </div>
        </div>
      )}

      {/* Mode 2 – Percentage Per Month */}
      {scheduleMode === "percentage" && (
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
            % Rate of Total Balance per Month
          </label>
          <div className="relative">
            <input
              type="number"
              min="0.1"
              max="100"
              step="0.1"
              value={percentagePerMonth}
              onChange={(e) => setPercentagePerMonth(e.target.value)}
              className="w-full h-9 px-3 pr-8 text-base sm:text-xs font-semibold bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
            />
            <span className="absolute right-3 top-2.5 text-slate-400 text-xs font-bold">
              %
            </span>
          </div>

          {preview && (
            <div className="mt-2.5 bg-amber-50/80 border border-amber-200 rounded-2xl p-3 space-y-1 text-xs text-amber-900">
              <p className="font-extrabold uppercase tracking-wider text-[10px] text-amber-800 m-0">
                Schedule Preview
              </p>
              <p className="m-0 font-medium">
                Monthly payout:{" "}
                <strong className="tabular-nums">
                  ₹{parseFloat(preview.monthlyAmount).toLocaleString("en-IN")}
                </strong>
              </p>
              <p className="m-0 font-medium">
                Total duration:{" "}
                <strong className="tabular-nums">{preview.totalMonths} months</strong>
                {preview.hasRemainder && (
                  <span className="ml-1 text-amber-700 font-semibold tabular-nums">
                    (final adjustment: ₹{parseFloat(preview.lastAmount).toLocaleString("en-IN")})
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Start Date */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
          First Payment Due Date
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-base sm:text-xs font-semibold bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
          />
        </div>
      </div>

      {createError && (
        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5 font-bold m-0">
          {createError}
        </p>
      )}

      <div className="flex gap-2.5 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.96] press-effect cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleCreateSchedule}
          disabled={creating}
          className="flex-1 py-2 text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] rounded-xl shadow-xs transition-all active:scale-[0.96] press-effect disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {creating ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <CreditCard size={14} />
          )}
          <span>{creating ? "Generating…" : "Generate Milestone Schedule"}</span>
        </button>
      </div>
    </div>
  );
}
