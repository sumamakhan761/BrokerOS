"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/Dialog";
import { UploadCloud, FileText, Loader2, CheckCircle2 } from "lucide-react";

interface InboundCommissionReceiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { file: File | null; remarks: string }) => Promise<void>;
  isSaving: boolean;
  commissionAmount: string | number;
}

export function InboundCommissionReceiveDialog({
  isOpen,
  onClose,
  onConfirm,
  isSaving,
  commissionAmount,
}: InboundCommissionReceiveDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [remarks, setRemarks] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleConfirm = async () => {
    await onConfirm({ file, remarks });
    setFile(null);
    setRemarks("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white border border-slate-200/80 shadow-2xl">
        <DialogHeader className="space-y-1 pb-2 border-b border-slate-100">
          <DialogTitle className="text-base font-extrabold text-[var(--text-primary)] tracking-tight">
            Mark Inbound Commission as Received
          </DialogTitle>
          <DialogDescription className="text-xs text-[var(--text-secondary)]">
            Record receipt of builder commission into brokerage treasury. Expected amount is{" "}
            <span className="font-extrabold text-emerald-700 tabular-nums">
              ₹{Number(commissionAmount).toLocaleString("en-IN")}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3.5">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Transaction / Cheque Reference (Optional)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Cheque #409212 / NEFT Ref UTR8912"
              className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Upload Payment Advice / Receipt (Optional)
            </label>
            <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:bg-slate-50 transition-all text-center group cursor-pointer bg-slate-50/50">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
              />
              {file ? (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 bg-purple-50 text-[var(--brand-700)] rounded-xl flex items-center justify-center border border-purple-200 shadow-2xs">
                    <FileText size={18} />
                  </div>
                  <p className="text-xs font-bold text-[var(--text-primary)] line-clamp-1 m-0">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-[var(--brand-700)] font-bold mt-1 m-0">
                    Click to replace
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[var(--brand-700)] border border-slate-200 transition-colors shadow-2xs">
                    <UploadCloud size={18} />
                  </div>
                  <p className="text-xs font-bold text-[var(--text-primary)] mt-1 m-0">
                    Upload Bank Slip / Invoice Copy
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2.5 pt-3 border-t border-slate-100 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.96] press-effect cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSaving}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all active:scale-[0.96] press-effect disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {isSaving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <CheckCircle2 size={14} />
            )}
            <span>Mark Received</span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
