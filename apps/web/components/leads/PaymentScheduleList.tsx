"use client";

import React, { useState } from "react";
import { CreditCard, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { MarkAsPaidDialog } from "@/components/payments/MarkAsPaidDialog";

interface PaymentScheduleListProps {
  schedules: any[];
  netAmount: number;
  onRefresh: () => void;
}

export function PaymentScheduleList({
  schedules,
  netAmount,
  onRefresh,
}: PaymentScheduleListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(0);

  const handleMarkPaid = (id: string, amount: number) => {
    setSelectedScheduleId(id);
    setSelectedAmount(amount);
    setDialogOpen(true);
  };

  const paidCount = schedules.filter((s) => s.status === "PAID").length;
  const totalAmount = schedules.reduce(
    (sum, s) => sum + parseFloat(s.amount),
    0
  );
  const paidAmount = schedules.reduce(
    (sum, s) => sum + (parseFloat(s.amount) - parseFloat(s.remainingAmount)),
    0
  );
  const progressPct =
    totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  return (
    <>
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)] border border-purple-200 shadow-2xs">
            <CreditCard size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-[var(--text-primary)] text-sm tracking-tight m-0">
              Payment Milestones
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 m-0 tabular-nums">
              {paidCount} of {schedules.length} installments cleared
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] m-0">
            Recovery
          </p>
          <p className="font-extrabold text-[var(--brand-700)] text-sm tabular-nums m-0">
            {progressPct}%
          </p>
        </div>
      </div>

      {/* Progress Track */}
      <div className="h-1.5 bg-slate-100 w-full overflow-hidden">
        <div
          className="h-full bg-[var(--brand-600)] transition-all duration-500 rounded-r-full"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Summary Bento */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
        <div className="p-3 text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-0.5 m-0">
            Scheduled
          </p>
          <p className="font-extrabold text-[var(--text-primary)] text-xs tabular-nums m-0">
            ₹{netAmount.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="p-3 text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 mb-0.5 m-0">
            Collected
          </p>
          <p className="font-extrabold text-emerald-800 text-xs tabular-nums m-0">
            ₹{paidAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="p-3 text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 mb-0.5 m-0">
            Outstanding
          </p>
          <p className="font-extrabold text-amber-800 text-xs tabular-nums m-0">
            ₹{(netAmount - paidAmount).toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
      </div>

      {/* Installment List */}
      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {schedules.map((schedule) => {
          const isOverdue =
            new Date(schedule.dueDate) < new Date() &&
            schedule.status !== "PAID";
          return (
            <div
              key={schedule.id}
              className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    schedule.status === "PAID"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : isOverdue
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {schedule.status === "PAID" ? (
                    <CheckCircle2 size={15} />
                  ) : isOverdue ? (
                    <AlertCircle size={15} />
                  ) : (
                    <Clock size={15} />
                  )}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[var(--text-primary)] m-0">
                    {schedule.milestoneName}
                  </h4>
                  <p
                    className={`text-[10px] font-bold mt-0.5 m-0 tabular-nums ${
                      isOverdue ? "text-rose-600" : "text-[var(--text-muted)]"
                    }`}
                  >
                    Due:{" "}
                    {new Date(schedule.dueDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-extrabold text-xs text-[var(--text-primary)] tabular-nums m-0">
                    ₹{parseFloat(schedule.amount).toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                  {schedule.status === "PAID" ? (
                    <span className="text-[10px] text-emerald-700 font-extrabold">
                      Settled ✓
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-700 font-bold tabular-nums">
                      Bal: ₹{parseFloat(schedule.remainingAmount).toLocaleString(
                        "en-IN",
                        { maximumFractionDigits: 0 }
                      )}
                    </span>
                  )}
                </div>

                {schedule.status !== "PAID" && (
                  <button
                    onClick={() =>
                      handleMarkPaid(
                        schedule.id,
                        parseFloat(schedule.remainingAmount)
                      )
                    }
                    className="opacity-0 group-hover:opacity-100 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all active:scale-[0.96] press-effect shadow-2xs cursor-pointer"
                  >
                    Mark Paid
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {dialogOpen && (
        <MarkAsPaidDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          scheduleId={selectedScheduleId}
          amount={selectedAmount}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}
