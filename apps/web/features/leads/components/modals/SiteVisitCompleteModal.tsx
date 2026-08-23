import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { X } from 'lucide-react';

interface SiteVisitCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteVisit: any;
  onRefresh: () => void;
}

export function SiteVisitCompleteModal({
  isOpen,
  onClose,
  siteVisit,
  onRefresh
}: SiteVisitCompleteModalProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    interestLevel: '',
    budgetConfirmed: '',
    configInterest: '',
    customerReaction: '',
    customerObjections: '',
    closingProbability: '',
    meetingNotes: '',
    nextAction: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/leads/site-visits/${siteVisit?.id || siteVisit}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
          interestLevel: form.interestLevel || undefined,
          budgetConfirmed: form.budgetConfirmed ? Number(form.budgetConfirmed) : undefined,
          configInterest: form.configInterest,
          customerReaction: form.customerReaction,
          customerObjections: form.customerObjections,
          closingProbability: form.closingProbability,
          meetingNotes: form.meetingNotes,
          nextAction: form.nextAction,
        }),
      });

      if (res.ok) {
        onRefresh();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto rounded-3xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Complete Site Visit</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {siteVisit?.arrivedAt && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">Arrival Verified</p>
              <p className="text-xs text-emerald-700 mt-0.5">Arrived at: {new Date(siteVisit.arrivedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
              {siteVisit.arriveLatitude && siteVisit.arriveLongitude && (
                <a href={`https://maps.google.com/?q=${siteVisit.arriveLatitude},${siteVisit.arriveLongitude}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-semibold hover:underline mt-1 inline-block">
                  View Coordinates on Google Maps
                </a>
              )}
            </div>
          </div>
        )}

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Interest Level</label>
              <select value={form.interestLevel} onChange={e => setForm({ ...form, interestLevel: e.target.value })} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm w-full">
                <option value="">Select...</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="NOT_INTERESTED">Not Interested</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Budget Confirmed (₹)</label>
              <input type="number" value={form.budgetConfirmed} onChange={e => setForm({ ...form, budgetConfirmed: e.target.value })} placeholder="e.g. 5000000" className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm w-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Config Liked</label>
              <input type="text" value={form.configInterest} onChange={e => setForm({ ...form, configInterest: e.target.value })} placeholder="e.g. 2BHK, Corner" className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm w-full" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Customer Reaction</label>
              <select value={form.customerReaction} onChange={e => setForm({ ...form, customerReaction: e.target.value })} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm w-full">
                <option value="">Select...</option>
                <option value="VERY_POSITIVE">Very Positive</option>
                <option value="POSITIVE">Positive</option>
                <option value="NEUTRAL">Neutral</option>
                <option value="NEGATIVE">Negative</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Closing Probability</label>
            <select value={form.closingProbability} onChange={e => setForm({ ...form, closingProbability: e.target.value })} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm w-full">
              <option value="">Select...</option>
              <option value="VERY_HIGH">Very High</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Customer Objections</label>
            <textarea value={form.customerObjections} onChange={e => setForm({ ...form, customerObjections: e.target.value })} className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none text-sm transition-all" placeholder="Any objections raised? Price? Location?" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Meeting Notes</label>
            <textarea value={form.meetingNotes} onChange={e => setForm({ ...form, meetingNotes: e.target.value })} className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none text-sm transition-all" placeholder="General discussion points..." />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Next Action Plan</label>
            <input type="text" value={form.nextAction} onChange={e => setForm({ ...form, nextAction: e.target.value })} placeholder="e.g. Call tomorrow, send brochure" className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm w-full" />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm">
            {saving ? 'Saving...' : 'Mark as Completed'}
          </button>
        </div>
      </Card>
    </div>
  );
}
