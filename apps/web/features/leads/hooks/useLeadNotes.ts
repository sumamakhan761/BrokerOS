import { useState } from 'react';
import { toast } from 'sonner';

export function useLeadNotes(leadId: string, userId: string | undefined, lead: any, setLead: (lead: any) => void) {
  const [notes, setNotes] = useState<any[]>([]);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState<string | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);

  const fetchNotes = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/leads/${leadId}/notes`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (e) {
      console.error('Failed to fetch notes:', e);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (lead && newStatus !== lead.status) {
      setPendingStatusChange(newStatus);
      setIsNoteModalOpen(true);
    }
  };

  const saveNote = async () => {
    if (!newNoteContent.trim()) return;
    setIsSavingNote(true);
    try {
      if (!userId) {
        toast.error('You must be logged in to create a note.');
        setIsSavingNote(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newNoteContent,
          userId,
          statusAtTimeOfNote: pendingStatusChange || lead?.status,
        }),
      });

      if (res.ok) {
        const newNote = await res.json();
        setNotes([newNote, ...notes]);
        setNewNoteContent('');
        if (pendingStatusChange && lead) {
          setLead({ ...lead, status: pendingStatusChange, subStatus: 'PENDING' });
          setPendingStatusChange(null);
        }
        setIsNoteModalOpen(false);
      }
    } catch (e) {
      console.error('Failed to save note:', e);
    } finally {
      setIsSavingNote(false);
    }
  };

  return {
    notes,
    isNoteModalOpen,
    setIsNoteModalOpen,
    newNoteContent,
    setNewNoteContent,
    pendingStatusChange,
    setPendingStatusChange,
    isSavingNote,
    fetchNotes,
    handleStatusChange,
    saveNote,
  };
}
