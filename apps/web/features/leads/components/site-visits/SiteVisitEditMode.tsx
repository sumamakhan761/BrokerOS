import React from 'react';
import { SiteVisitCompleteModalData } from '@/features/leads/types/site-visit-constants';

interface SiteVisitEditModeProps {
  svId: string;
  editForm: SiteVisitCompleteModalData;
  setEditForm: (form: SiteVisitCompleteModalData) => void;
  saving: boolean;
  saveEdit: (svId: string) => void;
  onCancel: () => void;
}

export function SiteVisitEditMode({ svId, editForm, setEditForm, saving, saveEdit, onCancel }: SiteVisitEditModeProps) {
  return (
    <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">Interest Level</label>
          <select
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            value={editForm.interestLevel}
            onChange={e => setEditForm({ ...editForm, interestLevel: e.target.value })}
          >
            <option value="">Select...</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="NOT_INTERESTED">Not Interested</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">Budget Confirmed (₹)</label>
          <input
            type="number"
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            value={editForm.budgetConfirmed}
            onChange={e => setEditForm({ ...editForm, budgetConfirmed: e.target.value })}
            placeholder="e.g. 5000000"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">Config They Liked</label>
          <input
            type="text"
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            value={editForm.configInterest}
            onChange={e => setEditForm({ ...editForm, configInterest: e.target.value })}
            placeholder="e.g. 2BHK, Corner Unit"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">Customer Reaction</label>
          <select
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            value={editForm.customerReaction}
            onChange={e => setEditForm({ ...editForm, customerReaction: e.target.value })}
          >
            <option value="">Select...</option>
            <option value="VERY_POSITIVE">Very Positive</option>
            <option value="POSITIVE">Positive</option>
            <option value="NEUTRAL">Neutral</option>
            <option value="NEGATIVE">Negative</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">Closing Probability</label>
          <select
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            value={editForm.closingProbability}
            onChange={e => setEditForm({ ...editForm, closingProbability: e.target.value })}
          >
            <option value="">Select...</option>
            <option value="VERY_HIGH">Very High</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">Next Action</label>
          <input
            type="text"
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            value={editForm.nextAction}
            onChange={e => setEditForm({ ...editForm, nextAction: e.target.value })}
            placeholder="e.g. Send brochure"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1.5">Objections Raised</label>
        <textarea
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
          rows={2}
          value={editForm.customerObjections}
          onChange={e => setEditForm({ ...editForm, customerObjections: e.target.value })}
          placeholder="Any objections raised by customer..."
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1.5">Meeting Notes</label>
        <textarea
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
          rows={2}
          value={editForm.meetingNotes}
          onChange={e => setEditForm({ ...editForm, meetingNotes: e.target.value })}
          placeholder="General meeting notes..."
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => saveEdit(svId)}
          disabled={saving}
          className="flex-1 bg-emerald-600 text-white text-sm rounded-xl py-2.5 font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={onCancel}
          className="px-5 border border-gray-200 text-gray-700 text-sm rounded-xl py-2.5 font-medium hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

