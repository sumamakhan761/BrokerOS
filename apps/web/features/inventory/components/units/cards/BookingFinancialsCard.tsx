import React from "react";
import { Handshake } from "lucide-react";

interface BookingFinancialsCardProps {
  booking: any;
  customer: any;
  renderField: (label: string, value: any) => React.ReactNode;
}

export function BookingFinancialsCard({
  booking,
  customer,
  renderField,
}: BookingFinancialsCardProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs mt-4">
      <div className="bg-slate-50/80 border-b border-slate-100 px-4 py-2.5 flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-800">
          <Handshake size={13} />
        </div>
        <h3 className="text-[10px] font-extrabold text-[var(--text-primary)] uppercase tracking-wider m-0">
          Financials & Brokerage Settlements
        </h3>
      </div>
      <div className="p-4 space-y-3.5 text-xs">
        {booking.brokerageRecords && booking.brokerageRecords.length > 0 ? (
          booking.brokerageRecords.map((record: any, idx: number) => (
            <div
              key={record.id || idx}
              className="grid grid-cols-2 gap-y-3 gap-x-2 pb-3 border-b border-slate-100"
            >
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-0.5 m-0">
                  Brokerage Rate (%)
                </p>
                <p className="text-xs font-bold text-[var(--text-primary)] tabular-nums m-0">
                  {record.brokeragePercent
                    ? `${record.brokeragePercent}%`
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-0.5 m-0">
                  Commission Payable
                </p>
                <p className="text-xs font-extrabold text-emerald-700 tabular-nums m-0">
                  {record.brokerageAmount
                    ? `₹${Number(record.brokerageAmount).toLocaleString("en-IN")}`
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-0.5 m-0">
                  Settlement Status
                </p>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    record.status === "PAID"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  {record.status}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-0.5 m-0">
                  Net Disbursed
                </p>
                <p className="text-xs font-extrabold text-[var(--text-primary)] tabular-nums m-0">
                  {record.netPayable
                    ? `₹${Number(record.netPayable).toLocaleString("en-IN")}`
                    : "-"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 pb-3 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-0.5 m-0">
                Commission Rate (%)
              </p>
              <p className="text-xs font-bold text-[var(--text-primary)] tabular-nums m-0">
                {booking.commissionPercentage
                  ? `${booking.commissionPercentage}%`
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-0.5 m-0">
                Commission Payout
              </p>
              <p className="text-xs font-extrabold text-emerald-700 tabular-nums m-0">
                {booking.commissionAmount
                  ? `₹${Number(booking.commissionAmount).toLocaleString("en-IN")}`
                  : "-"}
              </p>
            </div>
          </div>
        )}

        {customer?.lead?.broker ? (
          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            {renderField(
              "Linked Broker Partner",
              customer.lead.broker.name ||
                customer.lead.broker.companyName ||
                "-"
            )}
            {renderField(
              "Broker Contact Phone",
              customer.lead.broker.phone || "-"
            )}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-muted)] italic m-0">
            Direct customer deal — No external broker partner linked.
          </p>
        )}
      </div>
    </div>
  );
}
