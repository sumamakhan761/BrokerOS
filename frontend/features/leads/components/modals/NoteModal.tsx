import React from 'react';
import { Card } from '@/components/ui/Card';
import { X } from 'lucide-react';

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
  isSavingNote
}: NoteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {pendingStatusChange ? `Change Status to ${pendingStatusChange.replace(/_/g, ' ')}` : 'Add Note'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {pendingStatusChange && (
          <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200">
            Please add a note explaining this status change.
          </div>
        )}

        <textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="Type your note here..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm text-black"
          autoFocus
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveNote}
            disabled={isSavingNote || !newNoteContent.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSavingNote ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </Card>
    </div>
  );
}
