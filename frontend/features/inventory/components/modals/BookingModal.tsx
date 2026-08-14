"use client";

import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { authClient } from "@/lib/auth-client";
import { useEffect } from 'react';

interface BookingModalProps {
  unit: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingModal({ unit, isOpen, onClose, onSuccess }: BookingModalProps) {
  const { data: session } = authClient.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
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
    paymentMode: 'Bank Transfer',
    transactionRef: '',
    loanRequired: false,
    remarks: ''
  });

  if (!isOpen || !unit) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const userId = session?.user?.id;
      
      // We assume selectedLeadId is populated, or fallback for demo
      const payload = {
        userId,
        unitId: unit.id,
        unitDescription: `Unit ${unit.unitNumber} - ${unit.type}`,
        ...formData
      };

      if (!selectedLeadId) {
        throw new Error("Please select a Lead / Customer to book this unit for.");
      }

      // Hit the real backend booking endpoint
      const res = await fetch(`${baseUrl}/api/leads/${selectedLeadId}/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Unit is no longer available. Another executive just booked this unit.");
      }
      
      // The backend endpoint already updates the unit status within a database transaction to prevent race conditions.
      // We don't need to manually patch the inventory status here anymore, as `createBooking` handles it safely.

      // Success
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess();
      }, 500);

    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || "Failed to confirm booking.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none md:p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />

      <div className="relative w-full max-h-[90vh] bg-white rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out flex flex-col md:rounded-2xl md:max-w-xl mx-auto pointer-events-auto z-10">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white md:rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Book Unit {unit.unitNumber}</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {unit.type.replace('_', ' ')} • {unit.carpetArea} sqft • {unit.facing}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto bg-slate-50">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-900 text-sm">Booking Failed</h4>
                <p className="text-sm text-rose-700 mt-1">{error}</p>
                <button onClick={onSuccess} className="mt-2 text-sm font-semibold text-rose-800 underline">Refresh Grid</button>
              </div>
            </div>
          )}

          <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Customer Details section */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">1. Customer Info</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Lead / Customer</label>
                <select 
                  required
                  className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={selectedLeadId}
                  onChange={e => setSelectedLeadId(e.target.value)}
                >
                  <option value="">-- Choose Lead --</option>
                  {leads.map((lead: any) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.firstName} {lead.lastName} {lead.phone ? `(${lead.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Financial Details section */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wide">2. Financial Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Agreed Price ($)</label>
                  <input 
                    type="number" required
                    className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.agreedPrice}
                    onChange={e => setFormData({ ...formData, agreedPrice: Number(e.target.value) })}
                  />
                  {formData.agreedPrice < unit.basePrice && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">Below base price (${unit.basePrice})</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Token Amount ($)</label>
                  <input 
                    type="number" required
                    className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.bookingAmount}
                    onChange={e => setFormData({ ...formData, bookingAmount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
                  <select 
                    className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.paymentMode}
                    onChange={e => setFormData({ ...formData, paymentMode: e.target.value })}
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Ref</label>
                  <input 
                    type="text" required
                    className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.transactionRef}
                    onChange={e => setFormData({ ...formData, transactionRef: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="loanRequired"
                  className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  checked={formData.loanRequired}
                  onChange={e => setFormData({ ...formData, loanRequired: e.target.checked })}
                />
                <label htmlFor="loanRequired" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Customer requires a bank loan
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <label className="block text-sm font-medium text-slate-700 mb-1">Remarks (Optional)</label>
              <textarea 
                rows={3}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none"
                value={formData.remarks}
                onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Any special conditions or promises made..."
              />
            </div>
            
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 md:rounded-b-2xl">
          <button 
            type="submit"
            form="booking-form"
            disabled={isSubmitting || !!error}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-md"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Confirm Booking & Lock Unit
          </button>
        </div>

      </div>
    </div>
  );
}
