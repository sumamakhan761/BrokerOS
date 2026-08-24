"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Plus, Loader2 } from "lucide-react";
import { PaymentScheduleForm } from "./PaymentScheduleForm";
import { PaymentScheduleList } from "./PaymentScheduleList";

interface PaymentHistoryCardProps {
  bookingId: string;
  agreedPrice: number;
  bookingAmount: number;
}

export function PaymentHistoryCard({
  bookingId,
  agreedPrice,
  bookingAmount,
}: PaymentHistoryCardProps) {
  const netAmount = agreedPrice - bookingAmount;

  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  const fetchSchedules = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(`${apiUrl}/api/payments/booking/${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-8 flex justify-center items-center h-48">
        <Loader2 size={24} className="animate-spin text-[var(--brand-600)]" />
      </div>
    );
  }

  // Empty State: Show schedule creator
  if (schedules.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden mb-6 animate-enter">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/70">
          <div className="w-9 h-9 rounded-2xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)] border border-purple-200 shadow-2xs">
            <CreditCard size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-[var(--text-primary)] text-sm tracking-tight m-0">
              Payment Milestones & Schedule
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 m-0">
              No installment schedule generated yet
            </p>
          </div>
        </div>

        {/* Amount Summary Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-b border-slate-100">
          <div className="p-4 text-center">
            <p className="text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider mb-1 m-0">
              Agreed Sale Price
            </p>
            <p className="font-extrabold text-[var(--text-primary)] text-sm tabular-nums m-0">
              ₹{agreedPrice.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wider mb-1 m-0">
              Booking Token Paid
            </p>
            <p className="font-extrabold text-amber-800 text-sm tabular-nums m-0">
              − ₹{bookingAmount.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="p-4 text-center bg-purple-50/50">
            <p className="text-[10px] text-[var(--brand-700)] font-extrabold uppercase tracking-wider mb-1 m-0">
              Net Balance to Schedule
            </p>
            <p className="font-extrabold text-[var(--brand-700)] text-base tabular-nums m-0">
              ₹{netAmount.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="p-6">
          {!showScheduleForm ? (
            <div className="text-center py-10 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 mx-auto border border-slate-200 shadow-2xs">
                <CreditCard size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--text-primary)] m-0">
                  Generate Installment Plan
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 max-w-sm mx-auto font-medium">
                  Schedule <strong className="text-[var(--text-primary)]">₹{netAmount.toLocaleString("en-IN")}</strong> in customizable monthly milestones for this booking.
                </p>
              </div>
              <button
                onClick={() => setShowScheduleForm(true)}
                className="inline-flex items-center gap-1.5 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs rounded-xl px-4 py-2 font-bold transition-all active:scale-[0.96] press-effect shadow-xs cursor-pointer"
              >
                <Plus size={14} />
                <span>Configure Schedule</span>
              </button>
            </div>
          ) : (
            <PaymentScheduleForm
              bookingId={bookingId}
              netAmount={netAmount}
              agreedPrice={agreedPrice}
              bookingAmount={bookingAmount}
              onSuccess={() => {
                setShowScheduleForm(false);
                fetchSchedules();
              }}
              onCancel={() => setShowScheduleForm(false)}
            />
          )}
        </div>
      </div>
    );
  }

  // Schedule exists: show installment list
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden mb-6 animate-enter">
      <PaymentScheduleList
        schedules={schedules}
        netAmount={netAmount}
        onRefresh={fetchSchedules}
      />
    </div>
  );
}
