import React from "react";

interface UnitEditFormProps {
  unit: any;
  formData: any;
  setFormData: (data: any) => void;
}

export function UnitEditForm({
  unit,
  formData,
  setFormData,
}: UnitEditFormProps) {
  return (
    <div className="space-y-3.5 animate-enter">
      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
          Unit Status
        </label>
        <select
          className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
          value={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value })
          }
        >
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="RESERVED">RESERVED</option>
          <option value="SOLD">SOLD</option>
          <option value="BLOCKED">BLOCKED</option>
        </select>
        {formData.status === "AVAILABLE" && unit.status !== "AVAILABLE" && (
          <p className="text-[10px] text-amber-700 font-bold mt-1 m-0">
            Warning: Changing to Available will reset any active bookings or holds.
          </p>
        )}
      </div>

      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
          Base Price (₹)
        </label>
        <input
          type="number"
          className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
          value={formData.basePrice}
          onChange={(e) => {
            const bp = Number(e.target.value);
            setFormData({
              ...formData,
              basePrice: bp,
              commissionAmount: (bp * formData.commissionPercentage) / 100,
            });
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 mb-1">
            Commission (%)
          </label>
          <input
            type="number"
            step="any"
            className="w-full h-9 px-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-base sm:text-xs font-bold text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-500/15 tabular-nums transition-all"
            value={formData.commissionPercentage}
            onChange={(e) => {
              const pct = Number(e.target.value);
              setFormData({
                ...formData,
                commissionPercentage: pct,
                commissionAmount: (formData.basePrice * pct) / 100,
              });
            }}
          />
        </div>

        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 mb-1">
            Commission Amount (₹)
          </label>
          <input
            type="number"
            step="any"
            className="w-full h-9 px-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-base sm:text-xs font-bold text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-500/15 tabular-nums transition-all"
            value={formData.commissionAmount}
            onChange={(e) => {
              const amt = Number(e.target.value);
              const pct =
                formData.basePrice > 0
                  ? (amt / formData.basePrice) * 100
                  : 0;
              const roundedPct = Math.round(pct * 100) / 100;
              setFormData({
                ...formData,
                commissionAmount: amt,
                commissionPercentage: roundedPct,
              });
            }}
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
          Carpet Area (sqft)
        </label>
        <input
          type="number"
          className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
          value={formData.carpetArea}
          onChange={(e) =>
            setFormData({ ...formData, carpetArea: Number(e.target.value) })
          }
        />
      </div>
    </div>
  );
}
