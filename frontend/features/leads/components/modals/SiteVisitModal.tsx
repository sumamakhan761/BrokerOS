import React from 'react';
import { Card } from '@/components/ui/Card';
import { X, Trash2 } from 'lucide-react';

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
  isSaving
}: SiteVisitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200 rounded-3xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {editingSiteVisitId ? 'Edit Site Visit' : 'Schedule Site Visit'}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Project</label>
            <select value={siteVisitData.projectId} onChange={(e) => setSiteVisitData({ ...siteVisitData, projectId: e.target.value })} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm w-full text-black">
              <option value="" disabled>Select Project</option>
              {availableProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Date & Time</label>
            <input type="datetime-local" value={siteVisitData.date} onChange={(e) => setSiteVisitData({ ...siteVisitData, date: e.target.value })} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm w-full text-black" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Google Maps Link (Destination)</label>
            <input type="url" placeholder="https://maps.google.com/..." value={siteVisitData.destinationUrl || ''} onChange={(e) => setSiteVisitData({ ...siteVisitData, destinationUrl: e.target.value })} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm w-full text-black" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Description / Notes</label>
            <textarea value={siteVisitData.description} onChange={(e) => setSiteVisitData({ ...siteVisitData, description: e.target.value })} className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none text-sm text-black transition-all" placeholder="Any specific requirements or notes..." />
          </div>
        </div>
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          {editingSiteVisitId ? (
            <button onClick={handleDeleteSiteVisit} className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          ) : <div></div>}
          <div className="flex gap-3">
            <button onClick={onClose} disabled={isSaving} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
            <button onClick={handleSaveSiteVisit} disabled={!siteVisitData.projectId || !siteVisitData.date || isSaving} className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm">
              {isSaving ? 'Saving...' : editingSiteVisitId ? 'Save Changes' : 'Schedule'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
