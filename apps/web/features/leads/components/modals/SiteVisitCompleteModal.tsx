import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { X, CheckCircle2, Navigation } from "lucide-react";

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
  onRefresh,
}: SiteVisitCompleteModalProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    interestLevel: "",
    budgetConfirmed: "",
    configInterest: "",
    customerReaction: "",
    customerObjections: "",
    closingProbability: "",
    meetingNotes: "",
    nextAction: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(
        `${apiUrl}/api/leads/site-visits/${siteVisit?.id || siteVisit}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "COMPLETED",
            completedAt: new Date().toISOString(),
            interestLevel: form.interestLevel || undefined,
            budgetConfirmed: form.budgetConfirmed
              ? Number(form.budgetConfirmed)
              : undefined,
            configInterest: form.configInterest,
            customerReaction: form.customerReaction,
            customerObjections: form.customerObjections,
            closingProbability: form.closingProbability,
            meetingNotes: form.meetingNotes,
            nextAction: form.nextAction,
          }),
        }
      );

      if (res.ok) {
        onRefresh();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-enter">
      <Card className="w-full max-w-2xl p-6 rounded-3xl border border-slate-200/80 shadow-2xl bg-white max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle2 size={16} />
            </div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight m-0">
              Complete & Log Site Visit
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Verified GPS Arrival Callout */}
        {siteVisit?.arrivedAt && (
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-emerald-950 m-0">
                GPS Location Verified by Agent
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5 tabular-nums m-0">
                Arrived at:{" "}
                {new Date(siteVisit.arrivedAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              {siteVisit.arriveLatitude && siteVisit.arriveLongitude && (
                <a
                  href={`https://maps.google.com/?q=${siteVisit.arriveLatitude},${siteVisit.arriveLongitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 mt-1 tabular-nums"
                >
                  <Navigation size={10} />
                  <span>View GPS Coordinates</span>
                </a>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3.5">
          {/* Row 1: Interest Level & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Interest Level
              </label>
              <select
                value={form.interestLevel}
                onChange={(e) =>
                  setForm({ ...form, interestLevel: e.target.value })
                }
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
              >
                <option value="">Select Level…</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="NOT_INTERESTED">Not Interested</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Confirmed Budget (₹)
              </label>
              <input
                type="number"
                value={form.budgetConfirmed}
                onChange={(e) =>
                  setForm({ ...form, budgetConfirmed: e.target.value })
                }
                placeholder="e.g. 7500000"
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 tabular-nums transition-all"
              />
            </div>
          </div>

          {/* Row 2: Config Liked & Customer Reaction */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Configuration Preferred
              </label>
              <input
                type="text"
                value={form.configInterest}
                onChange={(e) =>
                  setForm({ ...form, configInterest: e.target.value })
                }
                placeholder="e.g. 2 BHK Corner, 8th Floor"
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Customer Reaction
              </label>
              <select
                value={form.customerReaction}
                onChange={(e) =>
                  setForm({ ...form, customerReaction: e.target.value })
                }
                className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
              >
                <option value="">Select Reaction…</option>
                <option value="VERY_POSITIVE">Very Positive</option>
                <option value="POSITIVE">Positive</option>
                <option value="NEUTRAL">Neutral</option>
                <option value="NEGATIVE">Negative</option>
              </select>
            </div>
          </div>

          {/* Closing Probability */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Closing Probability
            </label>
            <select
              value={form.closingProbability}
              onChange={(e) =>
                setForm({ ...form, closingProbability: e.target.value })
              }
              className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 cursor-pointer transition-all"
            >
              <option value="">Select Probability…</option>
              <option value="VERY_HIGH">Very High</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Customer Objections */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Customer Objections Raised
            </label>
            <textarea
              value={form.customerObjections}
              onChange={(e) =>
                setForm({ ...form, customerObjections: e.target.value })
              }
              placeholder="Any price, location, or possession timeline objections raised during the visit..."
              className="w-full h-20 p-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 resize-none transition-all"
            />
          </div>

          {/* Meeting Notes */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Meeting & Discussion Notes
            </label>
            <textarea
              value={form.meetingNotes}
              onChange={(e) =>
                setForm({ ...form, meetingNotes: e.target.value })
              }
              placeholder="General discussion summary, decision makers present, etc."
              className="w-full h-20 p-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 resize-none transition-all"
            />
          </div>

          {/* Next Action */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Next Action Plan
            </label>
            <input
              type="text"
              value={form.nextAction}
              onChange={(e) =>
                setForm({ ...form, nextAction: e.target.value })
              }
              placeholder="e.g. Schedule negotiation meeting with Sales Manager"
              className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.96] press-effect cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all disabled:opacity-50 active:scale-[0.96] press-effect cursor-pointer"
          >
            {saving ? "Saving Record…" : "Mark as Completed"}
          </button>
        </div>
      </Card>
    </div>
  );
}
