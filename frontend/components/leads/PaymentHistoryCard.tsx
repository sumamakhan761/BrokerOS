'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Plus } from 'lucide-react';
import { PaymentScheduleForm } from './PaymentScheduleForm';
import { PaymentScheduleList } from './PaymentScheduleList';

interface PaymentHistoryCardProps {
  bookingId: string;
  agreedPrice: number;    // Full agreed price
  bookingAmount: number;  // Upfront token/booking amount already paid
}

export function PaymentHistoryCard({ bookingId, agreedPrice, bookingAmount }: PaymentHistoryCardProps) {
  const netAmount = agreedPrice - bookingAmount; // Amount to be paid in installments

  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  const fetchSchedules = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ─── Empty State: Show schedule creator ───────────────────────────────────
  if (schedules.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Payment Tracking</h3>
            <p className="text-xs text-gray-500 font-medium">No payment schedule created yet</p>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="grid grid-cols-3 gap-0 border-b border-gray-100">
          <div className="p-4 text-center border-r border-gray-100">
            <p className="text-xs text-gray-500 font-medium mb-1">Agreed Price</p>
            <p className="font-bold text-gray-900">₹{agreedPrice.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 text-center border-r border-gray-100">
            <p className="text-xs text-gray-500 font-medium mb-1">Booking Amount</p>
            <p className="font-bold text-orange-600">− ₹{bookingAmount.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 text-center bg-blue-50/50">
            <p className="text-xs text-blue-600 font-medium mb-1">Net to Schedule</p>
            <p className="font-bold text-blue-700 text-lg">₹{netAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="p-6">
          {!showScheduleForm ? (
            <div className="text-center py-8 bg-gray-50/50 rounded-2xl border border-gray-100">
              <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 font-medium mb-1">Generate Installment Schedule</p>
              <p className="text-gray-400 text-sm mb-6">
                Schedule ₹{netAmount.toLocaleString('en-IN')} in monthly installments for this booking.
              </p>
              <button
                onClick={() => setShowScheduleForm(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm rounded-xl px-5 py-2.5 font-medium hover:bg-blue-700 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Generate Schedule
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

  // ─── Schedule exists: show installment list ────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <PaymentScheduleList
        schedules={schedules}
        netAmount={netAmount}
        onRefresh={fetchSchedules}
      />
    </div>
  );
}
