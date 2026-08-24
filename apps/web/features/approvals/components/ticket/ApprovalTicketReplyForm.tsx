import React, { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle, RotateCcw, Paperclip, Send } from "lucide-react";

interface ApprovalTicketReplyFormProps {
  ticket: any;
  role: string;
  replyDesc: string;
  setReplyDesc: (val: string) => void;
  replyFile: File | null;
  setReplyFile: (val: File | null) => void;
  handleReply: () => void;
  handleRedo: () => void;
  handleInstantAction: (action: "APPROVE" | "REJECT") => void;
  loading: boolean;
}

export function ApprovalTicketReplyForm({
  ticket,
  role,
  replyDesc,
  setReplyDesc,
  replyFile,
  setReplyFile,
  handleReply,
  handleRedo,
  handleInstantAction,
  loading,
}: ApprovalTicketReplyFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (ticket.status === "CLOSED") {
    return null;
  }

  return (
    <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl flex flex-col gap-3">
      {/* Action Buttons for Manager */}
      {role === "SALES_MANAGER" && ticket.status === "REQUESTED" && (
        <div className="flex items-center justify-center gap-2 pb-1 border-b border-slate-100">
          <button
            onClick={() => handleInstantAction("APPROVE")}
            disabled={loading}
            className="h-8 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-[0.96] press-effect flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 size={14} />
            <span>Approve Request</span>
          </button>
          <button
            onClick={() => handleInstantAction("REJECT")}
            disabled={loading}
            className="h-8 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all active:scale-[0.96] press-effect flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <XCircle size={14} />
            <span>Reject Request</span>
          </button>
        </div>
      )}

      {role === "SALES_MANAGER" &&
        (ticket.status === "APPROVED" || ticket.status === "REJECTED") &&
        ticket.redoCount < 2 && (
          <div className="flex justify-center pb-1 border-b border-slate-100">
            <button
              onClick={handleRedo}
              disabled={loading}
              className="h-8 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all active:scale-[0.96] press-effect flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={13} />
              <span>Redo Decision ({2 - ticket.redoCount} left)</span>
            </button>
          </div>
        )}

      {/* Chat Input Bar */}
      <div className="flex flex-col gap-2">
        {replyFile && (
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-lg self-start text-xs font-bold text-[var(--brand-700)]">
            <Paperclip size={12} />
            <span className="truncate max-w-[200px]">{replyFile.name}</span>
            <button
              onClick={() => setReplyFile(null)}
              className="ml-1 text-purple-400 hover:text-purple-700"
            >
              <XCircle size={12} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={(e: any) => setReplyFile(e.target.files?.[0] || null)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Attach Document"
          >
            <Paperclip size={16} />
          </button>

          <input
            placeholder="Type your discussion response…"
            value={replyDesc}
            onChange={(e: any) => setReplyDesc(e.target.value)}
            className="flex-1 h-9 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 outline-none font-medium px-3 text-base sm:text-xs text-[var(--text-primary)] transition-all"
            onKeyDown={(e: any) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleReply();
              }
            }}
          />

          <button
            onClick={handleReply}
            disabled={loading || (!replyDesc.trim() && !replyFile)}
            className="w-9 h-9 rounded-xl bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white transition-all active:scale-[0.96] press-effect disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center justify-center cursor-pointer shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
