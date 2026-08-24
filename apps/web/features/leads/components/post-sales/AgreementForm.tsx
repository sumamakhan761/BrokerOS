import React, { useState, useEffect } from "react";
import { Upload, Download, FileText, CheckCircle2 } from "lucide-react";

interface AgreementFormProps {
  booking: any;
  saving: boolean;
  saveModelData: (endpoint: string, data: any) => void;
  uploadFile: (
    type: "loan" | "agreement" | "handover",
    fieldName: string,
    file: File
  ) => void;
  userRole?: string;
}

export function AgreementForm({
  booking,
  saving,
  saveModelData,
  uploadFile,
  userRole,
}: AgreementFormProps) {
  const [agreementData, setAgreementData] = useState(booking?.agreement || {});

  useEffect(() => {
    if (booking?.agreement) {
      setAgreementData(booking.agreement);
    }
  }, [booking?.agreement]);

  const isReadOnly = userRole === "CHANNEL_PARTNER";

  return (
    <div className="space-y-4">
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 ${
          isReadOnly ? "pointer-events-none opacity-80" : ""
        }`}
      >
        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Agreement Registration Number
          </label>
          <input
            type="text"
            placeholder="e.g. BND-AGR-2026-9821"
            value={agreementData.agreementNumber || ""}
            onChange={(e) =>
              setAgreementData({
                ...agreementData,
                agreementNumber: e.target.value,
              })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Execution Status
          </label>
          <select
            value={agreementData.status || "NOT_STARTED"}
            onChange={(e) =>
              setAgreementData({ ...agreementData, status: e.target.value })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
          >
            <option value="NOT_STARTED">Not Started</option>
            <option value="DRAFT_PREPARED">Draft Prepared</option>
            <option value="STAMP_DUTY_PAID">Stamp Duty Paid</option>
            <option value="REGISTERED">Registered</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Sub-Registrar Office
          </label>
          <input
            type="text"
            placeholder="e.g. Bandra Sub-Registrar Office II"
            value={agreementData.subRegistrarOffice || ""}
            onChange={(e) =>
              setAgreementData({
                ...agreementData,
                subRegistrarOffice: e.target.value,
              })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Registration Appointment
          </label>
          <input
            type="datetime-local"
            value={
              agreementData.appointmentTime
                ? new Date(agreementData.appointmentTime)
                    .toISOString()
                    .slice(0, 16)
                : ""
            }
            onChange={(e) =>
              setAgreementData({
                ...agreementData,
                appointmentTime: new Date(e.target.value).toISOString(),
              })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all cursor-pointer"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Stamp Duty Amount (₹)
          </label>
          <input
            type="number"
            placeholder="e.g. 450000"
            value={agreementData.stampDutyAmount || ""}
            onChange={(e) =>
              setAgreementData({
                ...agreementData,
                stampDutyAmount: Number(e.target.value),
              })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Registration Fee (₹)
          </label>
          <input
            type="number"
            placeholder="e.g. 30000"
            value={agreementData.registrationFee || ""}
            onChange={(e) =>
              setAgreementData({
                ...agreementData,
                registrationFee: Number(e.target.value),
              })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Legal Advocate / Lawyer
          </label>
          <input
            type="text"
            placeholder="Advocate Name"
            value={agreementData.lawyerName || ""}
            onChange={(e) =>
              setAgreementData({
                ...agreementData,
                lawyerName: e.target.value,
              })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Lawyer Contact Number
          </label>
          <input
            type="text"
            placeholder="+91..."
            value={agreementData.lawyerContact || ""}
            onChange={(e) =>
              setAgreementData({
                ...agreementData,
                lawyerContact: e.target.value,
              })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
          Internal Execution Remarks
        </label>
        <textarea
          placeholder="Enter legal remarks, execution status notes, or pending compliance..."
          value={agreementData.remarks || ""}
          onChange={(e) =>
            setAgreementData({ ...agreementData, remarks: e.target.value })
          }
          className="w-full text-base sm:text-xs p-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all resize-none text-[var(--text-primary)]"
          rows={2}
          disabled={isReadOnly}
        />
      </div>

      {!isReadOnly && (
        <button
          onClick={() => saveModelData("agreement", agreementData)}
          disabled={saving}
          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] shadow-xs transition-all active:scale-[0.96] press-effect disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving Details…" : "Save Agreement Details"}
        </button>
      )}

      {/* Document Uploads Row */}
      <div className="mt-4 border-t border-slate-100 pt-4 space-y-2.5">
        {[
          { key: "draftDocumentUrl", label: "Draft Agreement Copy" },
          { key: "finalDocumentUrl", label: "Signed & Registered Agreement" },
        ].map((field) => (
          <div
            key={field.key}
            className="flex items-center justify-between p-3.5 border border-slate-200/80 rounded-xl hover:bg-slate-50/80 bg-white shadow-2xs transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
                <FileText size={15} />
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {field.label}
              </span>
            </div>

            {booking?.agreement?.[field.key] ? (
              <a
                href={booking.agreement[field.key]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs bg-purple-50 text-[var(--brand-700)] hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg font-bold transition-all active:scale-[0.96] press-effect"
              >
                <Download size={13} />
                <span>View File</span>
              </a>
            ) : !isReadOnly ? (
              <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg font-bold transition-all active:scale-[0.96] press-effect">
                <Upload size={13} />
                <span>Upload PDF</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0])
                      uploadFile("agreement", field.key, e.target.files[0]);
                  }}
                  disabled={saving}
                />
              </label>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
