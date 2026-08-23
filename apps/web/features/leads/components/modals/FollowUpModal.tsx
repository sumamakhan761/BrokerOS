import React from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { X, Trash2 } from 'lucide-react';

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
  isSaving
}: FollowUpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {editingFollowUpId ? 'Edit Follow-up' : 'Schedule Follow-up'}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <Input label="Title" value={followUpData.title} onChange={(e) => setFollowUpData({ ...followUpData, title: e.target.value })} placeholder="e.g. Call about budget" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Date & Time</label>
            <input type="datetime-local" value={followUpData.date} onChange={(e) => setFollowUpData({ ...followUpData, date: e.target.value })} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm w-full text-black" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <textarea value={followUpData.description} onChange={(e) => setFollowUpData({ ...followUpData, description: e.target.value })} className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none text-sm text-black" placeholder="Any specific notes for this follow-up..." />
          </div>
        </div>
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
          {editingFollowUpId ? (
            <button onClick={handleDeleteFollowUp} className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          ) : <div></div>}
          <div className="flex gap-3">
            <button onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleSaveFollowUp} disabled={!followUpData.title || !followUpData.date || isSaving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {isSaving ? 'Saving...' : editingFollowUpId ? 'Save Changes' : 'Schedule'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
