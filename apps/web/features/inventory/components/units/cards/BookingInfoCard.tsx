import React from "react";
import { Building } from "lucide-react";

interface BookingInfoCardProps {
  booking: any;
  unit: any;
  renderField: (label: string, value: any) => React.ReactNode;
}

export function BookingInfoCard({
  booking,
  unit,
  renderField,
}: BookingInfoCardProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
      <div className="bg-slate-50/80 border-b border-slate-100 px-4 py-2.5 flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-800">
          <Building size={13} />
        </div>
        <h3 className="text-[10px] font-extrabold text-[var(--text-primary)] uppercase tracking-wider m-0">
          Booking Information
        </h3>
      </div>
      <div className="p-4 space-y-3.5 text-xs">
        {/* Unit / Project Context */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 pb-3 border-b border-slate-100">
          {renderField(
            "Project",
            booking.unit?.floor?.tower?.project?.name ||
              unit.project?.name ||
              "N/A"
          )}
          {renderField(
            "Tower",
            booking.unit?.floor?.tower?.name || unit.tower?.name || "N/A"
          )}
          {renderField(
            "Floor",
            booking.unit?.floor?.name ||
              booking.unit?.floor?.floorNumber ||
              unit.floor?.name ||
              unit.floor?.floorNumber ||
              "N/A"
          )}
          {renderField(
            "Unit Number",
            `${booking.unit?.unitNumber || unit.unitNumber} (${
              booking.unit?.type || unit.type || "N/A"
            })`
          )}
        </div>

        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
          <div>
            <p className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider mb-0.5 m-0">
              Agreed Sale Price
            </p>
            <p className="text-base font-extrabold text-emerald-950 tabular-nums m-0">
              ₹{Number(booking.agreedPrice || 0).toLocaleString("en-IN")}
            </p>
          </div>

          {renderField(
            "Booking Token",
            booking.bookingAmount
              ? `₹${Number(booking.bookingAmount).toLocaleString("en-IN")}`
              : "-"
          )}

          {renderField(
            "Commission (%)",
            booking.commissionPercentage
              ? `${booking.commissionPercentage}%`
              : "-"
          )}
          {renderField(
            "Commission Amount",
            booking.commissionAmount
              ? `₹${Number(booking.commissionAmount).toLocaleString("en-IN")}`
              : "-"
          )}

          {renderField("Payment Mode", booking.paymentMode || "-")}
          {renderField(
            "Transaction Ref",
            booking.transactionRef || "-"
          )}

          {renderField(
            "Home Loan Required",
            booking.loanRequired ? "Yes" : "No"
          )}
          {renderField("Closed By", booking.salesExec?.name || "-")}
        </div>

        {booking.remarks && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-0.5 m-0">
              Remarks
            </p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed m-0 font-medium">
              {booking.remarks}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
