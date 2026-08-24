import React from "react";
import { Card } from "@/components/ui/Card";
import { X, Trash2, Clock } from "lucide-react";

interface FollowUpData {
  title: string;
  description: string;
  date: string;
}

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingFollowUpId: string | null;
  followUpData: FollowUpData;
  setFollowUpData: (data: FollowUpData) => void;
  handleSaveFollowUp: () => void;
  handleDeleteFollowUp: () => void;
  isSaving?: boolean;
}

export function FollowUpModal({
  isOpen,
  onClose,
  editingFollowUpId,
  followUpData,
  setFollowUpData,
  handleSaveFollowUp,
  handleDeleteFollowUp,
  isSaving,
}: FollowUpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-enter">
      <Card className="w-full max-w-lg p-6 rounded-2xl border border-slate-200/80 shadow-2xl bg-white space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <Clock size={16} />
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight m-0">
              {editingFollowUpId ? "Edit Follow-up Details" : "Schedule Follow-up"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-3.5">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Title / Subject
            </label>
            <input
              type="text"
              value={followUpData.title}
              onChange={(e) =>
                setFollowUpData({ ...followUpData, title: e.target.value })
              }
              placeholder="e.g. Call regarding budget and floor plans"
              className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Scheduled Date & Time
            </label>
            <input
              type="datetime-local"
              value={followUpData.date}
              onChange={(e) =>
                setFollowUpData({ ...followUpData, date: e.target.value })
              }
              className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all cursor-pointer"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Follow-up Agenda / Notes
            </label>
            <textarea
              value={followUpData.description}
              onChange={(e) =>
                setFollowUpData({ ...followUpData, description: e.target.value })
              }
              placeholder="Key talking points or customer questions to answer..."
              className="w-full h-24 p-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 resize-none transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          {editingFollowUpId ? (
            <button
              onClick={handleDeleteFollowUp}
              className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-all active:scale-[0.96] press-effect cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.96] press-effect cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveFollowUp}
              disabled={
                !followUpData.title || !followUpData.date || isSaving
              }
              className="px-5 py-2 text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] rounded-xl shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.96] press-effect cursor-pointer"
            >
              {isSaving
                ? "Saving…"
                : editingFollowUpId
                ? "Save Changes"
                : "Schedule"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
