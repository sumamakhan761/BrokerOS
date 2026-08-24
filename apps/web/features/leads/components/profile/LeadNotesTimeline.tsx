import React from "react";
import { Card } from "@/components/ui/Card";
import { Plus, MessageSquare } from "lucide-react";

interface LeadNotesTimelineProps {
  notes: any[];
  setPendingStatusChange: (status: string | null) => void;
  setIsNoteModalOpen: (val: boolean) => void;
}

export function LeadNotesTimeline({
  notes,
  setPendingStatusChange,
  setIsNoteModalOpen,
}: LeadNotesTimelineProps) {
  return (
    <Card className="p-0 flex flex-col h-[520px] rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-2 px-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-tight m-0 flex items-center gap-2">
          <MessageSquare size={15} className="text-[var(--brand-600)]" />
          <span>Notes & Timeline</span>
        </h3>
        <button
          onClick={() => {
            setPendingStatusChange(null);
            setIsNoteModalOpen(true);
          }}
          className="w-7 h-7 bg-white text-[var(--brand-700)] rounded-full shadow-xs border border-slate-200 hover:bg-purple-50 flex items-center justify-center transition-all active:scale-[0.96] press-effect cursor-pointer"
          title="Add Note"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Notes Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notes.length === 0 ? (
          <div className="text-center text-[var(--text-muted)] text-xs font-medium py-16">
            No notes logged yet. Add one to document conversations with this lead.
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/70 hover:border-purple-200 transition-all space-y-2 animate-enter"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {note.user?.displayUsername ||
                    note.user?.username ||
                    note.user?.name ||
                    "Agent"}
                </span>
                <span className="text-[11px] font-medium text-[var(--text-muted)] tabular-nums">
                  {new Date(note.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <p className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed m-0">
                {note.content}
              </p>

              {note.statusAtTimeOfNote && (
                <div className="pt-1">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                    Status: {note.statusAtTimeOfNote.replace(/_/g, " ")}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
