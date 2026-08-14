import React from 'react';
import { Loader2, AlertCircle, Download } from 'lucide-react';
import { BookingCustomerCard } from './cards/BookingCustomerCard';
import { BookingInfoCard } from './cards/BookingInfoCard';
import { BookingFinancialsCard } from './cards/BookingFinancialsCard';
import { BookingPostSalesCards } from './cards/BookingPostSalesCards';

interface UnitBookingInfoProps {
  unit: any;
  loadingBooking: boolean;
  booking: any;
  handleCancelBooking: () => void;
  isSaving: boolean;
  readOnly?: boolean;
  refreshBooking?: () => void;
}

export function UnitBookingInfo({ unit, loadingBooking, booking, handleCancelBooking, isSaving, readOnly }: UnitBookingInfoProps) {
  if (unit.status !== 'RESERVED' && unit.status !== 'SOLD') {
    return null;
  }

  if (loadingBooking) {
    return (
      <div className="flex justify-center p-8 mt-8 border-t border-slate-100">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mt-8 bg-amber-50 border border-amber-100 rounded-xl p-4">
        <p className="text-sm text-amber-800 font-medium">This unit is currently locked but booking details could not be found.</p>
      </div>
    );
  }

  // Determine role-based visibility based on the current dashboard path
  const isAuthorizedToViewFinancials = typeof window !== 'undefined' && (
    window.location.pathname.includes('/closing-manager') ||
    window.location.pathname.includes('/sourcing-manager') ||
    window.location.pathname.includes('/channel-partner') ||
    window.location.pathname.includes('/admin') ||
    window.location.pathname.includes('/director')
  );

  const renderField = (label: string, value: any) => (
    <div>
      <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value || '-'}</p>
    </div>
  );

  const renderDocLink = (label: string, url: string | null) => {
    if (!url) return null;
    return (
      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 px-3 py-1.5 rounded-md font-bold transition-all">
          <Download className="w-3.5 h-3.5" /> View
        </a>
      </div>
    );
  };

  return (
    <div className="mt-8 space-y-5 border-t border-slate-100 pt-8">
      
      <BookingCustomerCard customer={booking.customer} />
      
      <BookingInfoCard booking={booking} unit={unit} renderField={renderField} />

      {isAuthorizedToViewFinancials && (
        <BookingFinancialsCard booking={booking} customer={booking.customer} renderField={renderField} />
      )}

      <BookingPostSalesCards booking={booking} renderField={renderField} renderDocLink={renderDocLink} />

      {!readOnly && (
        <button
          onClick={handleCancelBooking}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl font-bold transition-colors disabled:opacity-50 mt-4"
        >
          <AlertCircle className="w-4 h-4" />
          Revert to Available (Cancel Booking)
        </button>
      )}
    </div>
  );
}
