import React from "react";
import { Card } from "@/components/ui/Card";
import { X, MessageSquare } from "lucide-react";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingStatusChange: string | null;
  newNoteContent: string;
  setNewNoteContent: (content: string) => void;
  saveNote: () => void;
  isSavingNote: boolean;
}

export function NoteModal({
  isOpen,
  onClose,
  pendingStatusChange,
  newNoteContent,
  setNewNoteContent,
  saveNote,
  isSavingNote,
}: NoteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-enter">
      <Card className="w-full max-w-lg p-6 rounded-2xl border border-slate-200/80 shadow-2xl bg-white space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <MessageSquare size={16} />
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight m-0">
              {pendingStatusChange
                ? `Change Status to ${pendingStatusChange.replace(/_/g, " ")}`
                : "Add Interaction Note"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Status explanation notice if status is changing */}
        {pendingStatusChange && (
          <div className="p-3 bg-amber-50 text-amber-900 text-xs font-semibold rounded-xl border border-amber-200">
            Please add a brief note explaining the context for this pipeline status change.
          </div>
        )}

        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
            Note Content
          </label>
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Type your notes, discussion summary, or follow-up insights here..."
            className="w-full h-32 p-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 resize-none transition-all"
            autoFocus
          />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.96] press-effect cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={saveNote}
            disabled={isSavingNote || !newNoteContent.trim()}
            className="px-5 py-2 text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] rounded-xl shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.96] press-effect cursor-pointer"
          >
            {isSavingNote ? "Saving Note…" : "Save Note"}
          </button>
        </div>
      </Card>
    </div>
  );
}
