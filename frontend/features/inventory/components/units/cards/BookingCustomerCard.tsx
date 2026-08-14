import Link from 'next/link';
import { User, Phone, MapPin } from 'lucide-react';

interface BookingCustomerCardProps {
  customer: any;
}

export function BookingCustomerCard({ customer }: BookingCustomerCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-50/80 border-b border-slate-100 px-4 py-3 flex items-center gap-2">
        <User className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Customer Details</h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <Link href={`/dashboard/sales-manager/leads/${customer?.leadId}`} className="text-lg font-bold text-slate-900 hover:text-indigo-600 hover:underline">
              {customer?.firstName} {customer?.lastName}
            </Link>
            <div className="flex items-center gap-2 mt-1 text-slate-600">
              <Phone className="w-3.5 h-3.5" />
              <p className="text-sm font-medium">{customer?.phone}</p>
            </div>
          </div>
        </div>
        {(customer?.city || customer?.currentAddress) && (
          <div className="flex items-start gap-2 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
            <p className="text-sm font-medium leading-relaxed">
              {[customer?.currentAddress, customer?.city].filter(Boolean).join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
