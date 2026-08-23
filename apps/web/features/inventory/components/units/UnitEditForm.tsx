import React from 'react';

interface UnitEditFormProps {
  unit: any;
  formData: any;
  setFormData: (data: any) => void;
}

export function UnitEditForm({ unit, formData, setFormData }: UnitEditFormProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
        <select
          className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.status}
          onChange={e => setFormData({ ...formData, status: e.target.value })}
        >
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="RESERVED">RESERVED</option>
          <option value="SOLD">SOLD</option>
          <option value="BLOCKED">BLOCKED</option>
        </select>
        {formData.status === 'AVAILABLE' && unit.status !== 'AVAILABLE' && (
          <p className="text-xs text-amber-600 mt-2 font-medium">Warning: Changing back to Available will clear any active bookings or blocks.</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Base Price ($)</label>
        <input
          type="number"
          className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.basePrice}
          onChange={e => {
            const bp = Number(e.target.value);
            setFormData({
              ...formData,
              basePrice: bp,
              commissionAmount: (bp * formData.commissionPercentage) / 100
            });
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Commission (%)</label>
        <input
          type="number"
          step="any"
          className="w-full border-slate-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50"
          value={formData.commissionPercentage}
          onChange={e => {
            const pct = Number(e.target.value);
            setFormData({
              ...formData,
              commissionPercentage: pct,
              commissionAmount: (formData.basePrice * pct) / 100
            });
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Commission Amount ($)</label>
        <input
          type="number"
          step="any"
          className="w-full border-slate-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50"
          value={formData.commissionAmount}
          onChange={e => {
            const amt = Number(e.target.value);
            const pct = formData.basePrice > 0 ? (amt / formData.basePrice) * 100 : 0;
            const roundedPct = Math.round(pct * 100) / 100;
            setFormData({
              ...formData,
              commissionAmount: amt,
              commissionPercentage: roundedPct
            });
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Carpet Area (sq.ft)</label>
        <input
          type="number"
          className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.carpetArea}
          onChange={e => setFormData({ ...formData, carpetArea: Number(e.target.value) })}
        />
      </div>
    </div>
  );
}
