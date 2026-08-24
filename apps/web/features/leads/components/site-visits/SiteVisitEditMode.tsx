import React from "react";
import { SiteVisitCompleteModalData } from "@/features/leads/types/site-visit-constants";

interface SiteVisitEditModeProps {
  svId: string;
  editForm: SiteVisitCompleteModalData;
  setEditForm: (form: SiteVisitCompleteModalData) => void;
  saving: boolean;
  saveEdit: (svId: string) => void;
  onCancel: () => void;
}

export function SiteVisitEditMode({
  svId,
  editForm,
  setEditForm,
  saving,
  saveEdit,
  onCancel,
}: SiteVisitEditModeProps) {
  return (
    <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Interest Level
          </label>
          <select
            className="w-full h-8 px-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
            value={editForm.interestLevel}
            onChange={(e) =>
              setEditForm({ ...editForm, interestLevel: e.target.value })
            }
          >
            <option value="">Select...</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="NOT_INTERESTED">Not Interested</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Confirmed Budget (₹)
          </label>
          <input
            type="number"
            className="w-full h-8 px-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
            value={editForm.budgetConfirmed}
            onChange={(e) =>
              setEditForm({ ...editForm, budgetConfirmed: e.target.value })
            }
            placeholder="e.g. 5000000"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Configuration Liked
          </label>
          <input
            type="text"
            className="w-full h-8 px-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 transition-all"
            value={editForm.configInterest}
            onChange={(e) =>
              setEditForm({ ...editForm, configInterest: e.target.value })
            }
            placeholder="e.g. 2 BHK, Sea view"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Customer Reaction
          </label>
          <select
            className="w-full h-8 px-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
            value={editForm.customerReaction}
            onChange={(e) =>
              setEditForm({ ...editForm, customerReaction: e.target.value })
            }
          >
            <option value="">Select...</option>
            <option value="VERY_POSITIVE">Very Positive</option>
            <option value="POSITIVE">Positive</option>
            <option value="NEUTRAL">Neutral</option>
            <option value="NEGATIVE">Negative</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Closing Probability
          </label>
          <select
            className="w-full h-8 px-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
            value={editForm.closingProbability}
            onChange={(e) =>
              setEditForm({ ...editForm, closingProbability: e.target.value })
            }
          >
            <option value="">Select...</option>
            <option value="VERY_HIGH">Very High</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Next Action
          </label>
          <input
            type="text"
            className="w-full h-8 px-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 transition-all"
            value={editForm.nextAction}
            onChange={(e) =>
              setEditForm({ ...editForm, nextAction: e.target.value })
            }
            placeholder="e.g. Call tomorrow, send floor plan"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
          Objections Raised
        </label>
        <textarea
          className="w-full text-base sm:text-xs p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/15 transition-all resize-none"
          rows={2}
          value={editForm.customerObjections}
          onChange={(e) =>
            setEditForm({ ...editForm, customerObjections: e.target.value })
          }
          placeholder="Any specific price, location, or possession objections..."
        />
      </div>

      <div>
        <label className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
          Meeting Notes
        </label>
        <textarea
          className="w-full text-base sm:text-xs p-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/15 transition-all resize-none"
          rows={2}
          value={editForm.meetingNotes}
          onChange={(e) =>
            setEditForm({ ...editForm, meetingNotes: e.target.value })
          }
          placeholder="General discussion notes..."
        />
      </div>

      <div className="flex gap-2.5 pt-1">
        <button
          onClick={() => saveEdit(svId)}
          disabled={saving}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl py-2 font-bold disabled:opacity-50 transition-all active:scale-[0.96] press-effect shadow-xs cursor-pointer"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs rounded-xl py-2 font-bold transition-all active:scale-[0.96] press-effect cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
