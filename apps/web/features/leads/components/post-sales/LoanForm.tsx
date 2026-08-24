import React, { useState, useEffect } from "react";
import { Upload, Download, Landmark, FileText } from "lucide-react";

interface LoanFormProps {
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

export function LoanForm({
  booking,
  saving,
  saveModelData,
  uploadFile,
  userRole,
}: LoanFormProps) {
  const [loanData, setLoanData] = useState(booking?.loanCase || {});

  useEffect(() => {
    if (booking?.loanCase) {
      setLoanData(booking.loanCase);
    }
  }, [booking?.loanCase]);

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
            Loan Application Reference No.
          </label>
          <input
            type="text"
            placeholder="e.g. HDFC-HOM-2026-9812"
            value={loanData.loanApplicationNumber || ""}
            onChange={(e) =>
              setLoanData({
                ...loanData,
                loanApplicationNumber: e.target.value,
              })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Processing Stage
          </label>
          <select
            value={loanData.status || "NOT_APPLIED"}
            onChange={(e) =>
              setLoanData({ ...loanData, status: e.target.value })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
          >
            <option value="NOT_APPLIED">Not Applied</option>
            <option value="APPLIED">Applied</option>
            <option value="DOCUMENTS_SUBMITTED">Documents Submitted</option>
            <option value="UNDER_REVIEW">Under Credit Review</option>
            <option value="APPROVED">Sanctioned & Approved</option>
            <option value="DISBURSED">Fully Disbursed</option>
            <option value="REJECTED">Application Rejected</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Financing Bank / NBFC
          </label>
          <input
            type="text"
            placeholder="e.g. HDFC Bank, SBI, ICICI"
            value={loanData.bankName || ""}
            onChange={(e) =>
              setLoanData({ ...loanData, bankName: e.target.value })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Bank Branch
          </label>
          <input
            type="text"
            placeholder="e.g. BKC Commercial Branch"
            value={loanData.bankBranch || ""}
            onChange={(e) =>
              setLoanData({ ...loanData, bankBranch: e.target.value })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Loan Officer / DSA Executive
          </label>
          <input
            type="text"
            placeholder="e.g. Vikram Mehta"
            value={loanData.dsaName || ""}
            onChange={(e) =>
              setLoanData({ ...loanData, dsaName: e.target.value })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            DSA Phone Number
          </label>
          <input
            type="text"
            placeholder="+91..."
            value={loanData.dsaContact || ""}
            onChange={(e) =>
              setLoanData({ ...loanData, dsaContact: e.target.value })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Applied Loan Amount (₹)
          </label>
          <input
            type="number"
            placeholder="e.g. 6500000"
            value={loanData.loanAmount || ""}
            onChange={(e) =>
              setLoanData({
                ...loanData,
                loanAmount: Number(e.target.value),
              })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Approved Sanction Amount (₹)
          </label>
          <input
            type="number"
            placeholder="e.g. 6000000"
            value={loanData.approvedAmount || ""}
            onChange={(e) =>
              setLoanData({
                ...loanData,
                approvedAmount: Number(e.target.value),
              })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Sanctioned ROI Rate (%)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="e.g. 8.4"
            value={loanData.interestRate || ""}
            onChange={(e) =>
              setLoanData({
                ...loanData,
                interestRate: Number(e.target.value),
              })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Tenure Duration (Months)
          </label>
          <input
            type="number"
            placeholder="e.g. 240"
            value={loanData.tenure || ""}
            onChange={(e) =>
              setLoanData({
                ...loanData,
                tenure: Number(e.target.value),
              })
            }
            className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
          Loan Processing Notes & Underwriting Remarks
        </label>
        <textarea
          placeholder="Credit committee approval remarks, required additional guarantor documents, etc."
          value={loanData.internalNotes || ""}
          onChange={(e) =>
            setLoanData({ ...loanData, internalNotes: e.target.value })
          }
          className="w-full text-base sm:text-xs p-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all resize-none text-[var(--text-primary)]"
          rows={2}
          disabled={isReadOnly}
        />
      </div>

      {!isReadOnly && (
        <button
          onClick={() => saveModelData("loan-case", loanData)}
          disabled={saving}
          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] shadow-xs transition-all active:scale-[0.96] press-effect disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving Details…" : "Save Loan Details"}
        </button>
      )}

      {/* Sanction Letter Upload Card */}
      <div className="mt-4 border-t border-slate-100 pt-4 space-y-2.5">
        <div className="flex items-center justify-between p-3.5 border border-slate-200/80 rounded-xl hover:bg-slate-50/80 bg-white shadow-2xs transition-all">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-700">
              <Landmark size={15} />
            </div>
            <span className="text-xs font-bold text-[var(--text-primary)]">
              Bank Sanction Letter (Official PDF)
            </span>
          </div>

          {booking?.loanCase?.sanctionLetterUrl ? (
            <a
              href={booking.loanCase.sanctionLetterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs bg-purple-50 text-[var(--brand-700)] hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg font-bold transition-all active:scale-[0.96] press-effect"
            >
              <Download size={13} />
              <span>View Sanction Letter</span>
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
                    uploadFile(
                      "loan",
                      "sanctionLetterUrl",
                      e.target.files[0]
                    );
                }}
                disabled={saving}
              />
            </label>
          ) : null}
        </div>
      </div>
    </div>
  );
}
