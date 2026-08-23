import { useState } from 'react';
import { toast } from 'sonner';

export function useBrokerNotes(brokerId: string, userId: string | undefined, broker: any, setBroker: (broker: any) => void) {
  const [notes, setNotes] = useState<any[]>([]);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState<string | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);

  // We fetch broker with its relations, so notes come attached to it.
  // But we can extract this to just set notes locally if needed.
  const updateNotesFromBroker = (brokerData: any) => {
    if (brokerData && brokerData.notes) {
      setNotes(brokerData.notes);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (broker && newStatus !== broker.status) {
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
      const res = await fetch(`${apiUrl}/api/brokers/${brokerId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newNoteContent,
          userId,
        }),
      });

      if (res.ok) {
        const newNote = await res.json();
        setNotes([newNote, ...notes]);
        setNewNoteContent('');
        
        // If there was a pending status change, update the broker status on the backend too
        if (pendingStatusChange && broker) {
          const statusRes = await fetch(`${apiUrl}/api/brokers/${brokerId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: pendingStatusChange })
          });
          if (statusRes.ok) {
            setBroker({ ...broker, status: pendingStatusChange, subStatus: 'PENDING' });
          }
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
    setNotes,
    updateNotesFromBroker,
    isNoteModalOpen,
    setIsNoteModalOpen,
    newNoteContent,
    setNewNoteContent,
    pendingStatusChange,
    setPendingStatusChange,
    isSavingNote,
    handleStatusChange,
    saveNote,
  };
}
