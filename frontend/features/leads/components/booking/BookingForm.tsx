import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { useBookingForm } from '@/features/leads/hooks/useBookingForm';

const PAYMENT_MODES = ['Cash', 'Cheque', 'NEFT', 'UPI', 'RTGS', 'Demand Draft'];

interface BookingFormProps {
  leadId: string;
  userId: string;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  onRefresh: () => void;
  lead?: any;
  booking?: any;
}

export function BookingForm({ leadId, userId, showForm, setShowForm, onRefresh, lead, booking }: BookingFormProps) {
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
  } = useBookingForm(leadId, userId, showForm, setShowForm, onRefresh, lead, booking);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50/80 flex items-center justify-center border border-amber-100/50">
          <FileText className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{booking ? 'Edit Booking' : 'Booking'}</h3>
          <p className="text-xs text-gray-500 font-medium">{booking ? 'Modify booking details' : 'No booking yet'}</p>
        </div>
      </div>

      <div className="p-6">
        {!showForm ? (
          <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-gray-100">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-600 font-medium mb-1">No booking created</p>
            <p className="text-gray-400 text-sm mb-6">When this lead reaches booking stage, create a booking record here.</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-amber-500 text-white text-sm rounded-xl px-5 py-2.5 font-medium hover:bg-amber-600 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Booking
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="font-semibold text-gray-900 text-sm">{booking ? 'Edit Booking Details' : 'New Booking Details'}</p>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Project</label>
                  <select
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    value={selectedProjectId}
                    onChange={e => setSelectedProjectId(e.target.value)}
                  >
                    <option value="">Select Project...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Tower</label>
                  <select
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all"
                    value={selectedTowerId}
                    onChange={e => setSelectedTowerId(e.target.value)}
                    disabled={!selectedProjectId}
                  >
                    <option value="">Select Tower...</option>
                    {towers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Floor</label>
                  <select
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all"
                    value={selectedFloorId}
                    onChange={e => setSelectedFloorId(e.target.value)}
                    disabled={!selectedTowerId}
                  >
                    <option value="">Select Floor...</option>
                    {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Available Unit</label>
                  <select
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 transition-all"
                    value={selectedUnitId}
                    onChange={e => setSelectedUnitId(e.target.value)}
                    disabled={!selectedFloorId}
                  >
                    <option value="">Select Unit...</option>
                    {units.map(u => <option key={u.id} value={u.id}>Unit {u.unitNumber} - {u.type}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Unit / Property Description</label>
                <input
                  type="text"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none cursor-not-allowed"
                  value={form.unitDescription}
                  readOnly
                  placeholder="Auto-filled based on selection..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Agreed Total Price (₹)</label>
                  <input
                    type="number"
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    value={form.agreedPrice}
                    onChange={e => setForm({ ...form, agreedPrice: e.target.value })}
                    placeholder="e.g. 8200000"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Booking Amount / Token (₹)</label>
                  <input
                    type="number"
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    value={form.bookingAmount}
                    onChange={e => setForm({ ...form, bookingAmount: e.target.value })}
                    placeholder="e.g. 200000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Commission (%)</label>
                  <input
                    type="number"
                    className="w-full text-sm border border-emerald-200/60 rounded-xl px-3 py-2.5 bg-emerald-50/50 text-emerald-900 focus:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    value={form.commissionPercentage}
                    onChange={e => {
                      const pct = e.target.value;
                      const amt = form.agreedPrice && pct ? (Number(form.agreedPrice) * Number(pct) / 100).toFixed(0) : form.commissionAmount;
                      setForm({ ...form, commissionPercentage: pct, commissionAmount: String(amt) });
                    }}
                    placeholder="e.g. 2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Commission Amount (₹)</label>
                  <input
                    type="number"
                    className="w-full text-sm border border-emerald-200/60 rounded-xl px-3 py-2.5 bg-emerald-50/50 text-emerald-900 focus:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    value={form.commissionAmount}
                    onChange={e => {
                      const amt = e.target.value;
                      const pct = form.agreedPrice && amt ? (Number(amt) / Number(form.agreedPrice) * 100).toFixed(2) : form.commissionPercentage;
                      setForm({ ...form, commissionAmount: amt, commissionPercentage: String(pct) });
                    }}
                    placeholder="e.g. 164000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Payment Mode</label>
                  <select
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    value={form.paymentMode}
                    onChange={e => setForm({ ...form, paymentMode: e.target.value })}
                  >
                    <option value="">Select...</option>
                    {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Transaction / Cheque Ref</label>
                  <input
                    type="text"
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    value={form.transactionRef}
                    onChange={e => setForm({ ...form, transactionRef: e.target.value })}
                    placeholder="Reference number"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="loanRequired"
                  checked={form.loanRequired}
                  onChange={e => setForm({ ...form, loanRequired: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded border-gray-300"
                />
                <label htmlFor="loanRequired" className="text-sm font-medium text-gray-700">Home Loan Required</label>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Remarks</label>
                <textarea
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                  rows={2}
                  value={form.remarks}
                  onChange={e => setForm({ ...form, remarks: e.target.value })}
                  placeholder="Any special terms or conditions..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBooking}
                disabled={saving || !selectedUnitId || !form.agreedPrice}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-500 rounded-xl hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {saving ? 'Saving...' : booking ? 'Update Booking' : 'Create Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

