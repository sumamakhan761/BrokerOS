import React from 'react';
import { Handshake } from 'lucide-react';

interface BookingFinancialsCardProps {
  booking: any;
  customer: any;
  renderField: (label: string, value: any) => React.ReactNode;
}

export function BookingFinancialsCard({ booking, customer, renderField }: BookingFinancialsCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-5">
      <div className="bg-slate-50/80 border-b border-slate-100 px-4 py-3 flex items-center gap-2">
        <Handshake className="w-4 h-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Financials & Brokerage</h3>
      </div>
      <div className="p-4 space-y-4">
        {booking.brokerageRecords && booking.brokerageRecords.length > 0 ? (
          booking.brokerageRecords.map((record: any, idx: number) => (
            <div key={record.id || idx} className="grid grid-cols-2 gap-y-4 gap-x-2 pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Commission (%)</p>
                <p className="text-sm font-semibold text-slate-900">{record.brokeragePercent ? `${record.brokeragePercent}%` : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Commission Amount</p>
                <p className="text-sm font-bold text-emerald-600">{record.brokerageAmount ? `₹${Number(record.brokerageAmount).toLocaleString('en-IN')}` : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Status</p>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${record.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                  {record.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Net Payable</p>
                <p className="text-sm font-bold text-slate-900">{record.netPayable ? `₹${Number(record.netPayable).toLocaleString('en-IN')}` : '-'}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 pb-4 border-b border-slate-100">
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Commission (%)</p>
              <p className="text-sm font-semibold text-slate-900">{booking.commissionPercentage ? `${booking.commissionPercentage}%` : '-'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Commission Amount</p>
              <p className="text-sm font-bold text-emerald-600">{booking.commissionAmount ? `₹${Number(booking.commissionAmount).toLocaleString('en-IN')}` : '-'}</p>
            </div>
          </div>
        )}
        {customer?.lead?.broker ? (
          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            {renderField('Linked Broker', customer.lead.broker.name || customer.lead.broker.companyName || '-')}
            {renderField('Broker Phone', customer.lead.broker.phone || '-')}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">No broker linked to this deal.</p>
        )}
      </div>
    </div>
  );
}
