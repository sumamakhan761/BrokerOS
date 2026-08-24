"use client";

import React, { useEffect, useState } from "react";
import {
  CreditCard,
  Calendar,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function PaymentsPage() {
  const { data: session } = authClient.useSession();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(
        `/api/proxy/api/payments/closing-manager?managerId=${session.user.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [session]);

  const getStatusBadge = (status: string, dueDate: string) => {
    if (status === "PAID")
      return (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
          Paid
        </span>
      );
    if (new Date(dueDate) < new Date())
      return (
        <span className="bg-rose-50 text-rose-700 border border-rose-200/60 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
          Overdue
        </span>
      );
    return (
      <span className="bg-blue-50 text-blue-700 border border-blue-200/60 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-600)]" />
        <p className="text-xs font-semibold text-[var(--text-muted)]">
          Loading milestone payments…
        </p>
      </div>
    );
  }

  const overdue = payments.filter(
    (p) => new Date(p.dueDate) < new Date() && p.status === "PENDING"
  );
  const upcoming = payments.filter(
    (p) => new Date(p.dueDate) >= new Date() && p.status === "PENDING"
  );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5 m-0">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <CreditCard size={18} />
            </div>
            <span>Milestone Installments & Payment Collection</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5 m-0">
            Track and reconcile buyer milestone installments and deal down payments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 border border-rose-200/60">
            <AlertCircle size={22} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-0.5 m-0">
              Overdue Installments
            </p>
            <p className="text-2xl font-black text-rose-700 tabular-nums m-0">
              {overdue.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-200/60">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-0.5 m-0">
              Upcoming Installments
            </p>
            <p className="text-2xl font-black text-blue-700 tabular-nums m-0">
              {upcoming.length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xs border border-slate-200/80 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
            Action Required: Pending Invoices
          </h3>
          <span className="text-[10px] font-extrabold text-[var(--text-muted)] bg-slate-100 px-2 py-0.5 rounded-full tabular-nums">
            {payments.length} total
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2 bg-slate-50/50">
            <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-200/60">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="text-xs font-bold text-slate-800 m-0">
              All Payments Settled
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] font-medium max-w-sm m-0">
              No overdue or pending milestone payments currently require closing intervention.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="p-4 md:p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center text-[var(--brand-700)] shrink-0 border border-purple-200/60">
                    <CreditCard size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-bold text-xs text-[var(--text-primary)] truncate m-0">
                        {payment.milestoneName}
                      </h4>
                      {getStatusBadge(payment.status, payment.dueDate)}
                    </div>
                    <p className="text-[10px] font-semibold text-[var(--text-muted)] m-0 tabular-nums">
                      Booking #{payment.booking?.bookingNumber} • Due{" "}
                      {new Date(payment.dueDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="font-extrabold text-slate-900 text-sm tabular-nums m-0">
                      ₹{payment.remainingAmount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider m-0">
                      Balance Due
                    </p>
                  </div>

                  <Link
                    href={`/dashboard/closing-manager/lead-management/${payment.booking?.customer?.leadId}`}
                    className="p-2 bg-slate-50 border border-slate-200/80 rounded-xl hover:bg-purple-50 hover:text-[var(--brand-700)] hover:border-purple-200 transition-all text-slate-500 no-underline shadow-2xs"
                    title="Open Lead Profile"
                  >
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
