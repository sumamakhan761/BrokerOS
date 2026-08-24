import React from "react";
import { Card } from "@/components/ui/Card";
import { X, Trash2, MapPin } from "lucide-react";

interface SiteVisitData {
  projectId: string;
  description: string;
  date: string;
  destinationUrl?: string;
}

interface Project {
  id: string;
  name: string;
}

interface SiteVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSiteVisitId: string | null;
  siteVisitData: SiteVisitData;
  setSiteVisitData: (data: SiteVisitData) => void;
  handleSaveSiteVisit: () => void;
  handleDeleteSiteVisit: () => void;
  availableProjects: Project[];
  isSaving?: boolean;
}

export function SiteVisitModal({
  isOpen,
  onClose,
  editingSiteVisitId,
  siteVisitData,
  setSiteVisitData,
  handleSaveSiteVisit,
  handleDeleteSiteVisit,
  availableProjects,
  isSaving,
}: SiteVisitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-enter">
      <Card className="w-full max-w-lg p-6 rounded-2xl border border-slate-200/80 shadow-2xl bg-white space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <MapPin size={16} />
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] tracking-tight m-0">
              {editingSiteVisitId ? "Edit Site Visit Details" : "Schedule Site Visit"}
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
          {/* Project Selector */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Destination Project
            </label>
            <select
              value={siteVisitData.projectId}
              onChange={(e) =>
                setSiteVisitData({ ...siteVisitData, projectId: e.target.value })
              }
              className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all cursor-pointer"
            >
              <option value="" disabled>
                Select Project
              </option>
              {availableProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Visit Date & Time
            </label>
            <input
              type="datetime-local"
              value={siteVisitData.date}
              onChange={(e) =>
                setSiteVisitData({ ...siteVisitData, date: e.target.value })
              }
              className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all cursor-pointer"
            />
          </div>

          {/* Google Maps Link */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Google Maps Location Link (Optional)
            </label>
            <input
              type="url"
              placeholder="https://maps.google.com/..."
              value={siteVisitData.destinationUrl || ""}
              onChange={(e) =>
                setSiteVisitData({
                  ...siteVisitData,
                  destinationUrl: e.target.value,
                })
              }
              className="w-full h-9 px-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Visit Objectives / Notes
            </label>
            <textarea
              value={siteVisitData.description}
              onChange={(e) =>
                setSiteVisitData({
                  ...siteVisitData,
                  description: e.target.value,
                })
              }
              placeholder="Specific units to view, client preferences, or site coordination notes..."
              className="w-full h-24 p-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 resize-none transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          {editingSiteVisitId ? (
            <button
              onClick={handleDeleteSiteVisit}
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
              onClick={handleSaveSiteVisit}
              disabled={
                !siteVisitData.projectId || !siteVisitData.date || isSaving
              }
              className="px-5 py-2 text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] rounded-xl shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.96] press-effect cursor-pointer"
            >
              {isSaving
                ? "Saving…"
                : editingSiteVisitId
                ? "Save Changes"
                : "Schedule Visit"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
