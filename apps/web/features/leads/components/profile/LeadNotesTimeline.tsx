import React from 'react';
import { Card } from '@/components/ui/Card';
import { Plus } from 'lucide-react';

interface LeadNotesTimelineProps {
  notes: any[];
  setPendingStatusChange: (status: string | null) => void;
  setIsNoteModalOpen: (val: boolean) => void;
}

export function LeadNotesTimeline({
  notes,
  setPendingStatusChange,
  setIsNoteModalOpen
}: LeadNotesTimelineProps) {
  return (
    <Card className="p-0 flex flex-col h-[500px]">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
        <h3 className="text-lg font-semibold text-gray-900">Notes & Timeline</h3>
        <button
          onClick={() => {
            setPendingStatusChange(null);
            setIsNoteModalOpen(true);
          }}
          className="p-2 bg-white text-blue-600 rounded-full shadow-sm border border-gray-200 hover:bg-blue-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50/30">
        {notes.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">No notes yet. Add one to keep track of this lead.</div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {note.user?.displayUsername || note.user?.username || 'Unknown User'}
                  </span>
                </div>
                <span className="flex text-xs text-gray-500">{new Date(note.createdAt).toLocaleString()}
                </span>

              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
              {note.statusAtTimeOfNote && (
                <span className="items-center py-1 px-2 my-2 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  {note.statusAtTimeOfNote.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
