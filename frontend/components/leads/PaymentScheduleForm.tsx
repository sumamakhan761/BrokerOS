import React, { useState } from 'react';
import { CreditCard, Calendar, Percent, Hash } from 'lucide-react';

interface PaymentScheduleFormProps {
  bookingId: string;
  netAmount: number;
  agreedPrice: number;
  bookingAmount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentScheduleForm({
  bookingId,
  netAmount,
  agreedPrice,
  bookingAmount,
  onSuccess,
  onCancel,
}: PaymentScheduleFormProps) {
  const [scheduleMode, setScheduleMode] = useState<'months' | 'percentage'>('months');
  const [installments, setInstallments] = useState('12');
  const [frequency, setFrequency] = useState('MONTHLY');
  const [percentagePerMonth, setPercentagePerMonth] = useState('5');
  const [startDate, setStartDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const calcPercentagePreview = () => {
    const pct = parseFloat(percentagePerMonth);
    if (!pct || pct <= 0 || netAmount <= 0) return null;
    const monthlyAmt = (pct / 100) * netAmount;
    const fullMonths = Math.floor(netAmount / monthlyAmt);
    const remainder = parseFloat((netAmount - fullMonths * monthlyAmt).toFixed(2));
    return {
      monthlyAmount: monthlyAmt.toFixed(2),
      totalMonths: remainder > 0 ? fullMonths + 1 : fullMonths,
      lastAmount: remainder > 0 ? remainder.toFixed(2) : monthlyAmt.toFixed(2),
      hasRemainder: remainder > 0,
    };
  };

  const preview = scheduleMode === 'percentage' ? calcPercentagePreview() : null;

  const handleCreateSchedule = async () => {
    setCreating(true);
    setCreateError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';

      const body: any = {
        netAmount,
        startDate: startDate || new Date().toISOString(),
      };

      if (scheduleMode === 'months') {
        body.installmentsCount = parseInt(installments, 10);
        body.frequency = frequency;
      } else {
        body.percentagePerMonth = parseFloat(percentagePerMonth);
      }

      const res = await fetch(`${apiUrl}/api/payments/schedule/${bookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const err = await res.json().catch(() => ({}));
        setCreateError(err.message || 'Failed to create schedule. Please try again.');
      }
    } catch (error) {
      console.error(error);
      setCreateError('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {/* Net Amount Display */}
      <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Amount to Schedule</p>
          <p className="text-2xl font-bold text-blue-700">₹{netAmount.toLocaleString('en-IN')}</p>
          <p className="text-xs text-blue-500 mt-0.5">
            ₹{agreedPrice.toLocaleString('en-IN')} − ₹{bookingAmount.toLocaleString('en-IN')} booking
          </p>
        </div>
        <CreditCard className="w-8 h-8 text-blue-400" />
      </div>

      {/* Mode Toggle */}
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-2">Schedule Mode</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setScheduleMode('months')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
              scheduleMode === 'months'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <Hash className="w-4 h-4" />
            Fixed Months
          </button>
          <button
            onClick={() => setScheduleMode('percentage')}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
              scheduleMode === 'percentage'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <Percent className="w-4 h-4" />
            % Per Month
          </button>
        </div>
      </div>

      {/* Mode 1 – Fixed Months */}
      {scheduleMode === 'months' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Number of Months</label>
            <input
              type="number"
              min="1"
              value={installments}
              onChange={(e) => setInstallments(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {installments && netAmount > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                ≈ ₹{(netAmount / parseInt(installments || '1', 10)).toLocaleString('en-IN', { maximumFractionDigits: 2 })} / month
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
            </select>
          </div>
        </div>
      )}

      {/* Mode 2 – Percentage Per Month */}
      {scheduleMode === 'percentage' && (
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">% of Total Per Month</label>
          <div className="relative">
            <input
              type="number"
              min="0.1"
              max="100"
              step="0.1"
              value={percentagePerMonth}
              onChange={(e) => setPercentagePerMonth(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
          </div>

          {/* Preview */}
          {preview && (
            <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-1">
              <p className="text-xs font-semibold text-amber-800">Schedule Preview</p>
              <p className="text-xs text-amber-700">
                Monthly amount: <strong>₹{parseFloat(preview.monthlyAmount).toLocaleString('en-IN')}</strong>
              </p>
              <p className="text-xs text-amber-700">
                Total months: <strong>{preview.totalMonths}</strong>
                {preview.hasRemainder && (
                  <span className="ml-1 text-amber-600">
                    (last installment: ₹{parseFloat(preview.lastAmount).toLocaleString('en-IN')})
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* First Payment Date */}
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1.5">First Payment Date</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {createError && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{createError}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleCreateSchedule}
          disabled={creating}
          className="flex-1 bg-blue-600 text-white text-sm rounded-xl py-2.5 font-medium hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
        >
          {creating ? 'Generating...' : 'Generate Plan'}
        </button>
        <button
          onClick={onCancel}
          className="px-5 border border-gray-200 text-gray-700 text-sm rounded-xl py-2.5 font-medium hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
