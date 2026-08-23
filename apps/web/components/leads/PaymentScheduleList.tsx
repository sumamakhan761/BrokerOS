import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { MarkAsPaidDialog } from '@/components/payments/MarkAsPaidDialog';

interface PaymentScheduleListProps {
  schedules: any[];
  netAmount: number;
  onRefresh: () => void;
}

export function PaymentScheduleList({
  schedules,
  netAmount,
  onRefresh,
}: PaymentScheduleListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(0);

  const handleMarkPaid = (id: string, amount: number) => {
    setSelectedScheduleId(id);
    setSelectedAmount(amount);
    setDialogOpen(true);
  };

  const paidCount = schedules.filter((s) => s.status === 'PAID').length;
  const totalAmount = schedules.reduce((sum, s) => sum + parseFloat(s.amount), 0);
  const paidAmount = schedules.reduce(
    (sum, s) => sum + (parseFloat(s.amount) - parseFloat(s.remainingAmount)),
    0
  );
  const progressPct = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  return (
    <>
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Payment Milestones</h3>
            <p className="text-xs text-gray-500 font-medium">
              {paidCount} of {schedules.length} paid
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Progress</p>
          <p className="font-bold text-gray-900">{progressPct}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-gray-100">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Net Amount Summary */}
      <div className="grid grid-cols-3 gap-0 border-b border-gray-100">
        <div className="p-3 text-center border-r border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Total Scheduled</p>
          <p className="font-bold text-gray-900 text-sm">₹{netAmount.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-3 text-center border-r border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Paid</p>
          <p className="font-bold text-green-600 text-sm">
            ₹{paidAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-gray-500 font-medium">Remaining</p>
          <p className="font-bold text-orange-500 text-sm">
            ₹{(netAmount - paidAmount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Installment List */}
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {schedules.map((schedule) => {
          const isOverdue =
            new Date(schedule.dueDate) < new Date() && schedule.status !== 'PAID';
          return (
            <div
              key={schedule.id}
              className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    schedule.status === 'PAID'
                      ? 'bg-green-100'
                      : isOverdue
                      ? 'bg-red-100'
                      : 'bg-orange-100'
                  }`}
                >
                  {schedule.status === 'PAID' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : isOverdue ? (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">
                    {schedule.milestoneName}
                  </h4>
                  <p
                    className={`text-xs font-medium ${
                      isOverdue ? 'text-red-500' : 'text-gray-500'
                    }`}
                  >
                    Due:{' '}
                    {new Date(schedule.dueDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    ₹{parseFloat(schedule.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                  {schedule.status === 'PAID' ? (
                    <p className="text-xs text-green-600 font-semibold">Paid ✓</p>
                  ) : (
                    <p className="text-xs text-orange-500 font-semibold">
                      Rem: ₹{parseFloat(schedule.remainingAmount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </p>
                  )}
                </div>

                {schedule.status !== 'PAID' && (
                  <button
                    onClick={() =>
                      handleMarkPaid(schedule.id, parseFloat(schedule.remainingAmount))
                    }
                    className="opacity-0 group-hover:opacity-100 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                    title="Mark as Paid"
                  >
                    Mark Paid
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {dialogOpen && (
        <MarkAsPaidDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          scheduleId={selectedScheduleId}
          amount={selectedAmount}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}
