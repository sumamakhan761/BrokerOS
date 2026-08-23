import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

interface ClosingManagerHandoverFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  onSuccess: () => void;
}

export function ClosingManagerHandoverFormModal({ isOpen, onClose, lead, onSuccess }: ClosingManagerHandoverFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const token = localStorage.getItem('auth_token');

      const res = await fetch(`${apiUrl}/leads/${lead.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          status: 'HANDOVER',
          subStatus: 'DONE',
          note: notes
        })
      });

      if (!res.ok) {
        throw new Error('Failed to handover lead');
      }

      onSuccess();
    } catch (err: any) {
      console.error('Handover error:', err);
      setError(err.message || 'An error occurred during handover');
    } finally {
      setLoading(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Handover Lead</DialogTitle>
          <p className="text-sm text-slate-500 mt-2">
            Are you sure you want to handover {lead.firstName} {lead.lastName}? This will mark your process as complete.
          </p>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Handover Notes (Optional)</label>
            <textarea
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400 resize-none"
              rows={3}
              placeholder="Enter any notes for the handover..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {loading ? 'Processing...' : 'Confirm Handover'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
