"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Loader2, Key } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface BookingModalProps {
  unit: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingModal({
  unit,
  isOpen,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const { data: session } = authClient.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchLeads = async () => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
          const res = await fetch(`${baseUrl}/api/leads`);
          if (res.ok) {
            const data = await res.json();
            setLeads(data);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchLeads();
    }
  }, [isOpen]);

  const [formData, setFormData] = useState({
    agreedPrice: unit?.basePrice || 0,
    bookingAmount: 50000,
    paymentMode: "Bank Transfer",
    transactionRef: "",
    loanRequired: false,
    remarks: "",
  });

  if (!isOpen || !unit) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const userId = session?.user?.id;

      const payload = {
        userId,
        unitId: unit.id,
        unitDescription: `Unit ${unit.unitNumber} - ${unit.type}`,
        ...formData,
      };

      if (!selectedLeadId) {
        throw new Error("Please select a Lead / Customer to book this unit for.");
      }

      const res = await fetch(`${baseUrl}/api/leads/${selectedLeadId}/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            "Unit is no longer available. Another executive just booked this unit."
        );
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess();
      }, 300);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || "Failed to confirm booking.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-enter">
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 border border-slate-200/80">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <Key size={16} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight m-0">
                Book Unit {unit.unitNumber}
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 m-0 tabular-nums">
                {unit.type.replace("_", " ")} • {unit.carpetArea} sqft • {unit.facing || "N/A"}
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
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 font-medium">
            <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold m-0">Booking Action Blocked</p>
              <p className="mt-0.5 m-0">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Customer selection */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Select Client Lead / Customer *
            </label>
            <select
              required
              className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
            >
              <option value="">-- Choose Lead --</option>
              {leads.map((lead: any) => (
                <option key={lead.id} value={lead.id}>
                  {lead.firstName} {lead.lastName}{" "}
                  {lead.phone ? `(${lead.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Agreed Sale Price (₹) *
              </label>
              <input
                type="number"
                required
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
                value={formData.agreedPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    agreedPrice: Number(e.target.value),
                  })
                }
              />
              {formData.agreedPrice < unit.basePrice && (
                <p className="text-[10px] text-amber-600 font-bold mt-1 m-0 tabular-nums">
                  Discount applied: Below base price (₹{unit.basePrice.toLocaleString("en-IN")})
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Token Amount (₹) *
              </label>
              <input
                type="number"
                required
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
                value={formData.bookingAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bookingAmount: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Payment Mode
              </label>
              <select
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
                value={formData.paymentMode}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMode: e.target.value })
                }
              >
                <option value="Bank Transfer">Bank Transfer / NEFT</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Transaction / Cheque Ref *
              </label>
              <input
                type="text"
                required
                placeholder="UTR / Cheque No."
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
                value={formData.transactionRef}
                onChange={(e) =>
                  setFormData({ ...formData, transactionRef: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="loanRequired"
              className="w-4 h-4 accent-purple-600 rounded"
              checked={formData.loanRequired}
              onChange={(e) =>
                setFormData({ ...formData, loanRequired: e.target.checked })
              }
            />
            <label
              htmlFor="loanRequired"
              className="text-xs font-bold text-[var(--text-primary)] cursor-pointer"
            >
              Buyer requires home loan assistance
            </label>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Remarks & Special Terms
            </label>
            <textarea
              rows={2}
              className="w-full text-base sm:text-xs p-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all resize-none text-[var(--text-primary)]"
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              placeholder="Payment milestone dates, car parking commitments, etc."
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.96] press-effect cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedLeadId || !formData.agreedPrice}
              className="px-5 py-2 text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] rounded-xl shadow-xs transition-all active:scale-[0.96] press-effect disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              <span>{isSubmitting ? "Locking Unit…" : "Confirm Booking & Lock Unit"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
