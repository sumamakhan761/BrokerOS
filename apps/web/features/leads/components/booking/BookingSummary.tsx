import React, { useState } from "react";
import {
  FileText,
  Download,
  Upload,
  CheckCircle2,
  Landmark,
  XCircle,
  FileCheck,
  Send,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";

const DOC_TYPES = [
  { key: "AADHAAR", label: "Aadhaar Card Copy" },
  { key: "PAN", label: "PAN Card Copy" },
  { key: "PASSPORT_PHOTO", label: "Passport Photograph" },
  { key: "BOOKING_FORM", label: "Signed Booking Application Form" },
  { key: "INCOME_DOCUMENT", label: "Income & Banking Proof" },
  { key: "OTHER", label: "Other Documents" },
];

interface BookingData {
  id: string;
  unitDescription?: string;
  agreedPrice?: number;
  bookingAmount?: number;
  commissionPercentage?: number;
  commissionAmount?: number;
  paymentMode?: string;
  transactionRef?: string;
  loanRequired?: boolean;
  remarks?: string;
  documents: { type: string; fileUrl: string; title: string }[];
  status: string;
  createdAt: string;
}

interface BookingSummaryProps {
  booking: BookingData;
  leadId: string;
  onRefresh: () => void;
  onEdit?: () => void;
  userRole?: string;
}

export function BookingSummary({
  booking,
  leadId,
  onRefresh,
  onEdit,
  userRole,
}: BookingSummaryProps) {
  const [saving, setSaving] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: string
  ) => {
    const file = e.target.files?.[0];
    if (!file || !booking) return;

    setUploadingType(docType);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("docType", docType);
      formData.append("bookingId", booking.id);

      await fetch(`${apiUrl}/api/leads/${leadId}/booking/documents`, {
        method: "POST",
        body: formData,
      });
      toast.success("Document uploaded successfully");
      onRefresh();
    } catch {
      toast.error("Failed to upload document");
    } finally {
      setUploadingType(null);
    }
  };

  const handleRequestApproval = async () => {
    if (!booking) return;
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(`${apiUrl}/api/approvals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Booking Approval: Unit Booking Confirmation`,
          description: `Please approve the booking. Agreed Price: ₹${booking.agreedPrice}, Booking Token: ₹${booking.bookingAmount}`,
          type: "BOOKING",
          bookingId: booking.id,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to send approval request");
        return;
      }

      toast.success("Booking approval request sent to manager.");
      onRefresh();
    } catch {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsDone = async () => {
    if (!booking) return;
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(`${apiUrl}/api/leads/${leadId}/booking/done`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      if (!res.ok) {
        toast.error("Failed to mark booking as done");
        return;
      }

      toast.success("Booking marked as complete.");
      onRefresh();
    } catch {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const isConfirmed = booking.status === "CONFIRMED";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isConfirmed
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
          >
            {isConfirmed ? (
              <CheckCircle2 size={20} />
            ) : (
              <FileText size={20} />
            )}
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-[var(--text-primary)] m-0">
              Unit Booking Record
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isConfirmed ? (
                <span className="inline-flex items-center gap-1 text-[8px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={10} /> Booking Confirmed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[8px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Approval Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        {!isConfirmed && userRole !== "CHANNEL_PARTNER" && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                disabled={saving}
                className="text-xs bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl font-bold hover:bg-slate-50 disabled:opacity-50 transition-all shadow-2xs active:scale-[0.96] press-effect flex items-center gap-1.25 cursor-pointer"
              >
                <Edit2 size={12} />
                <span>Edit</span>
              </button>
            )}
            {userRole === "CLOSING_MANAGER" ? (
              <button
                onClick={handleMarkAsDone}
                disabled={saving}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl font-bold disabled:opacity-50 transition-all shadow-xs active:scale-[0.96] press-effect flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 size={13} />
                <span>{saving ? "Saving…" : "Mark Done"}</span>
              </button>
            ) : (
              <button
                onClick={handleRequestApproval}
                disabled={saving}
                className="text-xs bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white px-3.5 py-1.5 rounded-xl font-bold disabled:opacity-50 transition-all shadow-xs active:scale-[0.96] press-effect flex items-center gap-1.25 cursor-pointer"
              >
                <Send size={12} />
                <span className="text-[10px]">{saving ? "Sending…" : "Request"}</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Financial KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {booking.unitDescription && (
            <div className="sm:col-span-2 md:col-span-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] m-0">
                Booked Property Unit
              </p>
              <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5 m-0">
                {booking.unitDescription}
              </p>
            </div>
          )}

          {booking.agreedPrice && (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5">
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 m-0">
                Agreed Sale Price
              </p>
              <p className="text-[13px] font-extrabold text-emerald-950 tabular-nums mt-0.5 m-0">
                ₹{Number(booking.agreedPrice).toLocaleString("en-IN")}
              </p>
            </div>
          )}

          {booking.bookingAmount && (
            <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-3.5">
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-sky-800 m-0">
                Booking Token Paid
              </p>
              <p className="text-[13px] font-extrabold text-sky-950 tabular-nums mt-0.5 m-0">
                ₹{Number(booking.bookingAmount).toLocaleString("en-IN")}
              </p>
            </div>
          )}

          {booking.commissionPercentage && (
            <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3.5">
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-purple-800 m-0">
                Total Brokerage
              </p>
              <p className="text-[13px] font-extrabold text-purple-950 tabular-nums mt-0.5 m-0">
                {booking.commissionPercentage}%{" "}
                <span className="text-xs font-bold text-purple-700">
                  (₹{Number(booking.commissionAmount).toLocaleString("en-IN")})
                </span>
              </p>
            </div>
          )}

          {booking.paymentMode && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] m-0">
                Token Payment Mode
              </p>
              <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5 m-0">
                {booking.paymentMode}
              </p>
            </div>
          )}

          {booking.transactionRef && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] m-0">
                Transaction / UTR Ref
              </p>
              <p className="text-xs font-bold text-[var(--text-primary)] tabular-nums mt-0.5 m-0 truncate">
                {booking.transactionRef}
              </p>
            </div>
          )}

          {booking.loanRequired !== undefined && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] m-0">
                Home Loan Status
              </p>
              <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5 flex items-center gap-1 m-0">
                {booking.loanRequired ? (
                  <>
                    <span>Loan Assistance Required</span>
                  </>
                ) : (
                  <>
                    <span>Self-Financed</span>
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {booking.remarks && (
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 space-y-0.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 m-0">
              Commercial Remarks
            </p>
            <p className="text-xs text-amber-950 leading-relaxed m-0">
              {booking.remarks}
            </p>
          </div>
        )}

        {/* Documents Section */}
        <div className="pt-2">
          <h4 className="text-xs font-extrabold text-[var(--text-primary)] mb-3 flex items-center gap-2 m-0">
            <FileCheck size={16} className="text-[var(--brand-600)]" />
            <span>Booking Documents & Client Proofs</span>
          </h4>

          <div className="space-y-2.5">
            {DOC_TYPES.map((doc) => {
              const existing = booking.documents?.find(
                (d) => d.type === doc.key
              );
              return (
                <div
                  key={doc.key}
                  className="flex items-center justify-between p-3 border border-slate-200/80 rounded-xl hover:bg-slate-50/80 transition-all shadow-2xs bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border ${existing
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}
                    >
                      {existing ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <FileText size={16} />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)] m-0">
                        {doc.label}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {existing ? (
                      <a
                        href={existing.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.25 text-xs bg-purple-50 text-[var(--brand-700)] hover:bg-purple-100 border border-purple-200 px-3 py-1.2 rounded-lg font-bold transition-all active:scale-[0.96] press-effect"
                      >
                        <Download size={15} />
                        <span className="text-[9px]">View File</span>
                      </a>
                    ) : userRole !== "CHANNEL_PARTNER" ? (
                      <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg font-bold transition-all active:scale-[0.96] press-effect">
                        <Upload size={13} />
                        <span>
                          {uploadingType === doc.key
                            ? "Uploading…"
                            : "Upload"}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleDocumentUpload(e, doc.key)}
                          disabled={uploadingType !== null}
                        />
                      </label>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
