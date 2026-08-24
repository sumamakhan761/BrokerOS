import React from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { BookingCustomerCard } from "./cards/BookingCustomerCard";
import { BookingInfoCard } from "./cards/BookingInfoCard";
import { BookingFinancialsCard } from "./cards/BookingFinancialsCard";
import { BookingPostSalesCards } from "./cards/BookingPostSalesCards";

interface UnitBookingInfoProps {
  unit: any;
  loadingBooking: boolean;
  booking: any;
  handleCancelBooking: () => void;
  isSaving: boolean;
  readOnly?: boolean;
  refreshBooking?: () => void;
}

export function UnitBookingInfo({
  unit,
  loadingBooking,
  booking,
  handleCancelBooking,
  isSaving,
  readOnly,
}: UnitBookingInfoProps) {
  if (unit.status !== "RESERVED" && unit.status !== "SOLD") {
    return null;
  }

  if (loadingBooking) {
    return (
      <div className="flex justify-center p-8 mt-6 border-t border-slate-100">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--brand-600)]" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-xs text-amber-900 font-medium m-0">
          This unit is currently locked/reserved, but no active booking record could be located.
        </p>
      </div>
    );
  }

  const isAuthorizedToViewFinancials =
    typeof window !== "undefined" &&
    (window.location.pathname.includes("/closing-manager") ||
      window.location.pathname.includes("/sourcing-manager") ||
      window.location.pathname.includes("/channel-partner") ||
      window.location.pathname.includes("/admin") ||
      window.location.pathname.includes("/director"));

  const renderField = (label: string, value: any) => (
    <div>
      <p className="text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider mb-0.5 m-0">
        {label}
      </p>
      <p className="text-xs font-bold text-[var(--text-primary)] m-0">
        {value || "—"}
      </p>
    </div>
  );

  const renderDocLink = (label: string, url: string | null) => {
    if (!url) return null;
    return (
      <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
        <span className="text-xs font-bold text-[var(--text-primary)]">
          {label}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-[11px] bg-purple-50 text-[var(--brand-700)] hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg font-bold transition-all no-underline"
        >
          View File
        </a>
      </div>
    );
  };

  return (
    <div className="mt-6 space-y-4 border-t border-slate-100 pt-6 animate-enter">
      <BookingCustomerCard customer={booking.customer} />

      <BookingInfoCard
        booking={booking}
        unit={unit}
        renderField={renderField}
      />

      {isAuthorizedToViewFinancials && (
        <BookingFinancialsCard
          booking={booking}
          customer={booking.customer}
          renderField={renderField}
        />
      )}

      <BookingPostSalesCards
        booking={booking}
        renderField={renderField}
        renderDocLink={renderDocLink}
      />

      {!readOnly && (
        <button
          onClick={handleCancelBooking}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all active:scale-[0.96] press-effect disabled:opacity-50 mt-4 cursor-pointer"
        >
          <AlertCircle size={14} />
          <span>Revert to Available (Cancel Booking)</span>
        </button>
      )}
    </div>
  );
}
