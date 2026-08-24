import React, { useState } from "react";
import { AlertCircle, UploadCloud, X, Loader2, CheckCircle2, FileText } from "lucide-react";

interface MarkAsPaidDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
  amount: number;
  onSuccess: () => void;
}

export function MarkAsPaidDialog({
  isOpen,
  onClose,
  scheduleId,
  amount,
  onSuccess,
}: MarkAsPaidDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleUpload = async () => {
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("amountPaid", amount.toString());
      formData.append("remarks", "Uploaded via Web Dashboard");
      if (file) {
        formData.append("receipt", file);
      }

      const res = await fetch(`/api/proxy/api/payments/${scheduleId}/pay`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to mark as paid. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-enter">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200/80 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight m-0">
              Confirm Milestone Payment
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 m-0">
              Record receipt of installment into booking ledger
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-3.5">
          <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900">
              Installment Amount
            </span>
            <span className="text-base font-extrabold text-purple-950 tabular-nums">
              ₹{amount.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 flex gap-2.5 items-start text-xs text-amber-900">
            <AlertCircle size={14} className="text-amber-700 shrink-0 mt-0.5" />
            <p className="m-0 leading-relaxed font-medium">
              <strong>Tip:</strong> To capture photo proofs directly via camera during site visits, use the BrokerOS Mobile App.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Upload Transaction Receipt / Cheque (Optional)
            </label>
            <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-5 hover:bg-slate-50 transition-all text-center group cursor-pointer bg-slate-50/50">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFile(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {file ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 bg-purple-50 text-[var(--brand-700)] rounded-xl flex items-center justify-center border border-purple-200 shadow-2xs">
                    <FileText size={16} />
                  </div>
                  <p className="text-xs font-bold text-[var(--text-primary)] line-clamp-1 m-0">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-[var(--brand-700)] font-bold m-0">
                    Click to replace
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[var(--brand-700)] border border-slate-200 transition-colors shadow-2xs">
                    <UploadCloud size={16} />
                  </div>
                  <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5 m-0">
                    Upload Bank Slip / Cheque Image
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5 font-bold m-0">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.96] press-effect cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all active:scale-[0.96] press-effect flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {uploading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <CheckCircle2 size={14} />
            )}
            <span>{uploading ? "Processing…" : "Confirm Payment"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
