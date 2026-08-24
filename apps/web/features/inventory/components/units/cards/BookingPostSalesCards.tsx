import React from "react";
import {
  FileText,
  Landmark,
  PenTool,
  Key,
  CheckCircle2,
} from "lucide-react";

interface BookingPostSalesCardsProps {
  booking: any;
  renderField: (label: string, value: any) => React.ReactNode;
  renderDocLink: (label: string, url: string | null) => React.ReactNode | null;
}

export function BookingPostSalesCards({
  booking,
  renderField,
  renderDocLink,
}: BookingPostSalesCardsProps) {
  const { loanCase, agreement, possession, documents } = booking;

  return (
    <div className="space-y-4">
      {/* Documentation Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="bg-slate-50/80 border-b border-slate-100 px-4 py-2.5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-sky-50 flex items-center justify-center text-sky-700">
            <FileText size={13} />
          </div>
          <h3 className="text-[10px] font-extrabold text-[var(--text-primary)] uppercase tracking-wider m-0">
            KYC Documentation
          </h3>
        </div>
        <div className="p-4">
          {documents && documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 border border-slate-200/80 rounded-xl hover:bg-slate-50/50 bg-white"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)] m-0">
                        {doc.type}
                      </p>
                      {doc.description && (
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5 m-0 font-medium">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[11px] bg-purple-50 text-[var(--brand-700)] hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg font-bold transition-all no-underline"
                  >
                    View File
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)] italic m-0">
              No KYC files uploaded yet.
            </p>
          )}
        </div>
      </div>

      {/* Loan Details Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="bg-slate-50/80 border-b border-slate-100 px-4 py-2.5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
            <Landmark size={13} />
          </div>
          <h3 className="text-[10px] font-extrabold text-[var(--text-primary)] uppercase tracking-wider m-0">
            Home Loan Processing
          </h3>
        </div>
        <div className="p-4">
          {!loanCase ? (
            <p className="text-xs text-[var(--text-muted)] italic m-0">
              No loan application details recorded.
            </p>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                {renderField(
                  "Stage",
                  loanCase.status?.replace(/_/g, " ")
                )}
                {renderField("Lending Bank", loanCase.bankName)}
                {renderField(
                  "Application Ref",
                  loanCase.loanApplicationNumber
                )}
                {renderField(
                  "Applied Amount",
                  loanCase.loanAmount
                    ? `₹${Number(loanCase.loanAmount).toLocaleString("en-IN")}`
                    : null
                )}
                {renderField(
                  "Sanctioned Amount",
                  loanCase.approvedAmount
                    ? `₹${Number(loanCase.approvedAmount).toLocaleString("en-IN")}`
                    : null
                )}
                {renderField("DSA / Loan Officer", loanCase.dsaName)}
              </div>
              {loanCase.internalNotes && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-0.5 m-0">
                    Credit Notes
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] m-0 leading-relaxed font-medium">
                    {loanCase.internalNotes}
                  </p>
                </div>
              )}
              {renderDocLink("Sanction Letter", loanCase.sanctionLetterUrl)}
            </div>
          )}
        </div>
      </div>

      {/* Agreement Details Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="bg-slate-50/80 border-b border-slate-100 px-4 py-2.5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-700">
            <PenTool size={13} />
          </div>
          <h3 className="text-[10px] font-extrabold text-[var(--text-primary)] uppercase tracking-wider m-0">
            Agreement Execution
          </h3>
        </div>
        <div className="p-4">
          {!agreement ? (
            <p className="text-xs text-[var(--text-muted)] italic m-0">
              No agreement execution records available.
            </p>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                {renderField(
                  "Status",
                  agreement.status?.replace(/_/g, " ")
                )}
                {renderField(
                  "Agreement Number",
                  agreement.agreementNumber
                )}
                {renderField(
                  "Sub-Registrar Office",
                  agreement.subRegistrarOffice
                )}
                {renderField("Lawyer / Advocate", agreement.lawyerName)}
                {renderField(
                  "Stamp Duty Paid",
                  agreement.stampDutyAmount
                    ? `₹${Number(agreement.stampDutyAmount).toLocaleString("en-IN")}`
                    : null
                )}
                {renderField(
                  "Appointment Time",
                  agreement.appointmentTime
                    ? new Date(agreement.appointmentTime).toLocaleString()
                    : null
                )}
              </div>
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                {renderDocLink(
                  "Draft Agreement",
                  agreement.draftDocumentUrl
                )}
                {renderDocLink(
                  "Registered Agreement",
                  agreement.finalDocumentUrl
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Handover Details Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="bg-slate-50/80 border-b border-slate-100 px-4 py-2.5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-800">
            <Key size={13} />
          </div>
          <h3 className="text-[10px] font-extrabold text-[var(--text-primary)] uppercase tracking-wider m-0">
            Possession & Keys Handover
          </h3>
        </div>
        <div className="p-4">
          {!possession ? (
            <p className="text-xs text-[var(--text-muted)] italic m-0">
              No handover status configured.
            </p>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                {renderField(
                  "Status",
                  possession.status?.replace(/_/g, " ")
                )}
                {renderField(
                  "Handover Date",
                  possession.scheduledDate
                    ? new Date(possession.scheduledDate).toLocaleDateString()
                    : null
                )}
                {renderField(
                  "Parking Slot No.",
                  possession.parkingSlotNumber
                )}
                {renderField(
                  "Electricity Meter",
                  possession.electricityMeterNumber
                )}
                {renderField(
                  "Water Meter No.",
                  possession.waterMeterNumber
                )}
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider mb-0.5 m-0">
                    Compliance Checklist
                  </p>
                  <div className="flex flex-col gap-1 text-xs font-bold mt-0.5">
                    <span
                      className={
                        possession.snagResolved
                          ? "text-emerald-700"
                          : "text-slate-400"
                      }
                    >
                      {possession.snagResolved ? "✓" : "○"} Snags Rectified
                    </span>
                    <span
                      className={
                        possession.keysHandedOver
                          ? "text-emerald-700"
                          : "text-slate-400"
                      }
                    >
                      {possession.keysHandedOver ? "✓" : "○"} Keys Delivered
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                {renderDocLink(
                  "Occupancy Certificate (OC)",
                  possession.occupancyCertUrl
                )}
                {renderDocLink(
                  "Completion Certificate (CC)",
                  possession.completionCertUrl
                )}
                {renderDocLink(
                  "Handover Letter",
                  possession.handoverDocUrl
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
