import React from 'react';
import { NegotiationFormData } from '@/features/leads/types/negotiation-types';

interface NegotiationAddFormProps {
  form: NegotiationFormData;
  setForm: (form: NegotiationFormData) => void;
  saving: boolean;
  handleAddRound: () => void;
  onCancel: () => void;
}

export function NegotiationAddForm({ form, setForm, saving, handleAddRound, onCancel }: NegotiationAddFormProps) {
  return (
    <div className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm space-y-4">
      <p className="text-sm font-semibold text-gray-900">New Negotiation Round</p>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Round Title *</label>
          <input
            type="text"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Initial Negotiation, Counter Offer Round 2"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Asking Price (₹)</label>
            <input
              type="number"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              value={form.askingPrice}
              onChange={e => setForm({ ...form, askingPrice: e.target.value })}
              placeholder="e.g. 8500000"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Customer's Offered Price (₹)</label>
            <input
              type="number"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              value={form.offeredPrice}
              onChange={e => setForm({ ...form, offeredPrice: e.target.value })}
              placeholder="e.g. 7800000"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Customer Objections</label>
          <textarea
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
            rows={2}
            value={form.objections}
            onChange={e => setForm({ ...form, objections: e.target.value })}
            placeholder="What did the customer push back on?"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Your Response / Strategy</label>
          <textarea
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
            rows={2}
            value={form.strategy}
            onChange={e => setForm({ ...form, strategy: e.target.value })}
            placeholder="How did you respond? What's your plan?"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Next Step</label>
          <input
            type="text"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            value={form.nextStep}
            onChange={e => setForm({ ...form, nextStep: e.target.value })}
            placeholder="e.g. Escalate for discount approval, Give 2 days to decide"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleAddRound}
          disabled={saving || !form.title.trim()}
          className="flex-1 bg-violet-600 text-white text-sm rounded-xl py-2.5 font-medium hover:bg-violet-700 disabled:opacity-50 transition-all shadow-sm"
        >
          {saving ? 'Saving...' : 'Save Round'}
        </button>
        <button
          onClick={onCancel}
          className="px-5 border border-gray-200 text-gray-600 text-sm rounded-xl py-2.5 font-medium hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

