'use client';

import React from 'react';
import { Plus, Trash2, Loader2, User } from 'lucide-react';

interface ContactNotesTabProps {
  notes: any[];
  newNote: string;
  setNewNote: (val: string) => void;
  savingNote: boolean;
  handleCreateNote: (e: React.FormEvent) => Promise<void>;
  handleDeleteNote: (noteId: string) => Promise<void>;
}

export const ContactNotesTab: React.FC<ContactNotesTabProps> = ({
  notes,
  newNote,
  setNewNote,
  savingNote,
  handleCreateNote,
  handleDeleteNote,
}) => {
  return (
    <div className="space-y-4">
      <form onSubmit={handleCreateNote} className="space-y-2">
        <textarea
          rows={3}
          placeholder="Add an internal note about this customer..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full p-3 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500 resize-none transition-colors"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingNote || !newNote.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-2xs"
          >
            {savingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Add Note</span>
          </button>
        </div>
      </form>

      <div className="space-y-3 pt-2">
        {notes.length === 0 ? (
          <p className="text-center py-8 text-xs text-text-tertiary italic">
            No notes recorded yet.
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-3.5 bg-bg-base border border-border-default rounded-xl space-y-2 group"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-text-primary flex items-center gap-1.5">
                  <User className="w-3 h-3 text-brand-500" />
                  {note.author?.name || 'Agent'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-text-tertiary">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-500/10 rounded transition-opacity"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
