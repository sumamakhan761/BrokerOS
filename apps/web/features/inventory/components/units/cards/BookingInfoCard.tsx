import React from 'react';
import { Building } from 'lucide-react';

interface BookingInfoCardProps {
  booking: any;
  unit: any;
  renderField: (label: string, value: any) => React.ReactNode;
}

export function BookingInfoCard({ booking, unit, renderField }: BookingInfoCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-50/80 border-b border-slate-100 px-4 py-3 flex items-center gap-2">
        <Building className="w-4 h-4 text-amber-600" />
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Booking Info</h3>
      </div>
      <div className="p-4 space-y-4">
        {/* Unit / Project Context */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 pb-4 border-b border-slate-100">
          {renderField('Project', booking.unit?.floor?.tower?.project?.name || unit.project?.name || 'N/A')}
          {renderField('Tower', booking.unit?.floor?.tower?.name || unit.tower?.name || 'N/A')}
          {renderField('Floor', booking.unit?.floor?.name || booking.unit?.floor?.floorNumber || unit.floor?.name || unit.floor?.floorNumber || 'N/A')}
          {renderField('Unit Number', `${booking.unit?.unitNumber || unit.unitNumber} (${booking.unit?.type || unit.type || 'N/A'})`)}
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">Agreed Total Price</p>
            <p className="text-lg font-bold text-emerald-600">₹{Number(booking.agreedPrice || 0).toLocaleString('en-IN')}</p>
          </div>
          {renderField('Booking Amount / Token', booking.bookingAmount ? `₹${Number(booking.bookingAmount).toLocaleString('en-IN')}` : '-')}

          {renderField('Commission (%)', booking.commissionPercentage ? `${booking.commissionPercentage}%` : '-')}
          {renderField('Commission Amount', booking.commissionAmount ? `₹${Number(booking.commissionAmount).toLocaleString('en-IN')}` : '-')}

          {renderField('Payment Mode', booking.paymentMode || '-')}
          {renderField('Transaction / Cheque Ref', booking.transactionRef || '-')}

          {renderField('Home Loan Required', booking.loanRequired ? 'Yes' : 'No')}
          {renderField('Closed By', booking.salesExec?.name || '-')}
        </div>

        {booking.remarks && (
          <div className="pt-2 border-t border-slate-50">
            <p className="text-xs text-slate-500 font-medium mb-1">Remarks</p>
            <p className="text-sm text-slate-700">{booking.remarks}</p>
          </div>
        )}
      </div>
    </div>
  );
}
