import React from "react";
import { NegotiationFormData } from "@/features/leads/types/negotiation-types";

interface NegotiationAddFormProps {
  form: NegotiationFormData;
  setForm: (form: NegotiationFormData) => void;
  saving: boolean;
  handleAddRound: () => void;
  onCancel: () => void;
}

export function NegotiationAddForm({
  form,
  setForm,
  saving,
  handleAddRound,
  onCancel,
}: NegotiationAddFormProps) {
  return (
    <div className="border border-slate-200/80 rounded-2xl p-5 bg-white shadow-xs space-y-4 animate-enter">
      <p className="text-xs font-bold text-[var(--text-primary)] m-0">
        Log Negotiation Round
      </p>

      <div className="space-y-3.5">
        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Round Title / Context *
          </label>
          <input
            type="text"
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Initial Pricing Discussion, Floor Discount Counter"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
              Brokerage / Firm Asking Price (₹)
            </label>
            <input
              type="number"
              className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
              value={form.askingPrice}
              onChange={(e) =>
                setForm({ ...form, askingPrice: e.target.value })
              }
              placeholder="e.g. 8500000"
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
              Customer Offered Price (₹)
            </label>
            <input
              type="number"
              className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
              value={form.offeredPrice}
              onChange={(e) =>
                setForm({ ...form, offeredPrice: e.target.value })
              }
              placeholder="e.g. 7800000"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Customer Objections Raised
          </label>
          <textarea
            className="w-full text-base sm:text-xs p-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all resize-none text-[var(--text-primary)]"
            rows={2}
            value={form.objections}
            onChange={(e) =>
              setForm({ ...form, objections: e.target.value })
            }
            placeholder="What specific price, timeline, or inventory points did the customer push back on?"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Sales Strategy & Counter Response
          </label>
          <textarea
            className="w-full text-base sm:text-xs p-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all resize-none text-[var(--text-primary)]"
            rows={2}
            value={form.strategy}
            onChange={(e) => setForm({ ...form, strategy: e.target.value })}
            placeholder="How did you counter? Value propositions highlighted..."
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Agreed Next Step
          </label>
          <input
            type="text"
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
            value={form.nextStep}
            onChange={(e) => setForm({ ...form, nextStep: e.target.value })}
            placeholder="e.g. Escalate for discount approval ticket, Decision expected in 48 hours"
          />
        </div>
      </div>

      <div className="flex gap-2.5 pt-2 border-t border-slate-100">
        <button
          onClick={handleAddRound}
          disabled={saving || !form.title.trim()}
          className="flex-1 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs rounded-xl py-2 font-bold disabled:opacity-50 transition-all active:scale-[0.96] press-effect shadow-xs cursor-pointer"
        >
          {saving ? "Saving Round…" : "Save Negotiation Round"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs rounded-xl py-2 font-bold transition-all active:scale-[0.96] press-effect cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
