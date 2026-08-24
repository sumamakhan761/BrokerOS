import React from "react";
import { FileText, Plus } from "lucide-react";
import { useBookingForm } from "@/features/leads/hooks/useBookingForm";

const PAYMENT_MODES = [
  "Cash",
  "Cheque",
  "NEFT",
  "UPI",
  "RTGS",
  "Demand Draft",
];

interface BookingFormProps {
  leadId: string;
  userId: string;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  onRefresh: () => void;
  lead?: any;
  booking?: any;
  userRole?: string;
}

export function BookingForm({
  leadId,
  userId,
  showForm,
  setShowForm,
  onRefresh,
  lead,
  booking,
  userRole,
}: BookingFormProps) {
  const {
    saving,
    form,
    setForm,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    towers,
    selectedTowerId,
    setSelectedTowerId,
    floors,
    selectedFloorId,
    setSelectedFloorId,
    units,
    selectedUnitId,
    setSelectedUnitId,
    handleCreateBooking,
  } = useBookingForm(
    leadId,
    userId,
    showForm,
    setShowForm,
    onRefresh,
    lead,
    booking
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-200 text-amber-800">
          <FileText size={18} />
        </div>
        <div>
          <h3 className="text-xs font-bold text-[var(--text-primary)] m-0">
            {booking ? "Edit Confirmed Booking" : "Unit Booking"}
          </h3>
          <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 m-0">
            {booking
              ? "Modify unit parameters & pricing terms"
              : "No confirmed booking registered yet"}
          </p>
        </div>
      </div>

      <div className="p-5">
        {!showForm ? (
          <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-slate-100">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-semibold text-[var(--text-secondary)] m-0">
              No booking record created
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 mb-5">
              When this client confirms a unit sale, generate the booking record here.
            </p>
            {userRole !== "CHANNEL_PARTNER" && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-1.5 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs font-bold rounded-xl px-4 py-2 transition-all active:scale-[0.96] press-effect shadow-xs cursor-pointer"
              >
                <Plus size={14} />
                <span>Create Booking Record</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-enter">
            <p className="font-bold text-xs text-[var(--text-primary)] m-0">
              {booking ? "Update Booking Parameters" : "Enter New Booking Details"}
            </p>

            <div className="space-y-3.5">
              {/* Row 1: Project & Tower */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    Project
                  </label>
                  <select
                    className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                  >
                    <option value="">Select Project…</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    Tower
                  </label>
                  <select
                    className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 disabled:opacity-40 cursor-pointer transition-all"
                    value={selectedTowerId}
                    onChange={(e) => setSelectedTowerId(e.target.value)}
                    disabled={!selectedProjectId}
                  >
                    <option value="">Select Tower…</option>
                    {towers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Floor & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    Floor
                  </label>
                  <select
                    className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 disabled:opacity-40 cursor-pointer transition-all"
                    value={selectedFloorId}
                    onChange={(e) => setSelectedFloorId(e.target.value)}
                    disabled={!selectedTowerId}
                  >
                    <option value="">Select Floor…</option>
                    {floors.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    Inventory Unit No.
                  </label>
                  <select
                    className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 disabled:opacity-40 cursor-pointer transition-all"
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    disabled={!selectedFloorId}
                  >
                    <option value="">Select Unit…</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        Unit {u.unitNumber} — {u.type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Unit Auto-description */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                  Unit Specification Description
                </label>
                <input
                  type="text"
                  className="w-full h-9 px-3 bg-slate-100 border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-secondary)] outline-none cursor-not-allowed"
                  value={form.unitDescription}
                  readOnly
                  placeholder="Auto-populated from selected inventory unit…"
                />
              </div>

              {/* Row 3: Total Price & Token */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    Agreed Total Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
                    value={form.agreedPrice}
                    onChange={(e) =>
                      setForm({ ...form, agreedPrice: e.target.value })
                    }
                    placeholder="e.g. 8200000"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    Booking Token Paid (₹)
                  </label>
                  <input
                    type="number"
                    className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
                    value={form.bookingAmount}
                    onChange={(e) =>
                      setForm({ ...form, bookingAmount: e.target.value })
                    }
                    placeholder="e.g. 200000"
                  />
                </div>
              </div>

              {/* Row 4: Commission */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block mb-1">
                    Commission Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full h-9 px-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-base sm:text-xs font-bold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500/15 tabular-nums transition-all"
                    value={form.commissionPercentage}
                    onChange={(e) => {
                      const pct = e.target.value;
                      const amt =
                        form.agreedPrice && pct
                          ? (
                              (Number(form.agreedPrice) * Number(pct)) /
                              100
                            ).toFixed(0)
                          : form.commissionAmount;
                      setForm({
                        ...form,
                        commissionPercentage: pct,
                        commissionAmount: String(amt),
                      });
                    }}
                    placeholder="e.g. 2"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block mb-1">
                    Commission Amount (₹)
                  </label>
                  <input
                    type="number"
                    className="w-full h-9 px-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-base sm:text-xs font-bold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500/15 tabular-nums transition-all"
                    value={form.commissionAmount}
                    onChange={(e) => {
                      const amt = e.target.value;
                      const pct =
                        form.agreedPrice && amt
                          ? (
                              (Number(amt) / Number(form.agreedPrice)) *
                              100
                            ).toFixed(2)
                          : form.commissionPercentage;
                      setForm({
                        ...form,
                        commissionAmount: amt,
                        commissionPercentage: String(pct),
                      });
                    }}
                    placeholder="e.g. 164000"
                  />
                </div>
              </div>

              {/* Row 5: Payment Mode & Ref */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    Token Payment Mode
                  </label>
                  <select
                    className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
                    value={form.paymentMode}
                    onChange={(e) =>
                      setForm({ ...form, paymentMode: e.target.value })
                    }
                  >
                    <option value="">Select Mode…</option>
                    {PAYMENT_MODES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    Transaction / Cheque Reference
                  </label>
                  <input
                    type="text"
                    className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
                    value={form.transactionRef}
                    onChange={(e) =>
                      setForm({ ...form, transactionRef: e.target.value })
                    }
                    placeholder="Reference number or UTR"
                  />
                </div>
              </div>

              {/* Home Loan checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="loanRequired"
                  checked={form.loanRequired}
                  onChange={(e) =>
                    setForm({ ...form, loanRequired: e.target.checked })
                  }
                  className="w-4 h-4 accent-purple-600 rounded"
                />
                <label
                  htmlFor="loanRequired"
                  className="text-xs font-bold text-[var(--text-primary)] cursor-pointer"
                >
                  Home Loan Required by Buyer
                </label>
              </div>

              {/* Remarks */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                  Booking Remarks & Special Commercial Terms
                </label>
                <textarea
                  className="w-full text-base sm:text-xs p-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all resize-none text-[var(--text-primary)]"
                  rows={2}
                  value={form.remarks}
                  onChange={(e) =>
                    setForm({ ...form, remarks: e.target.value })
                  }
                  placeholder="Special payment milestones, interior allowances, or agreement deadlines..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.96] press-effect cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBooking}
                disabled={saving || !selectedUnitId || !form.agreedPrice}
                className="px-5 py-2 text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] rounded-xl shadow-xs transition-all active:scale-[0.96] press-effect disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving
                  ? "Saving…"
                  : booking
                  ? "Update Booking Record"
                  : "Confirm & Create Booking"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
