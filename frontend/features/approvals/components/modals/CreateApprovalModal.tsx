'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';

export default function CreateApprovalModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description) {
      toast.error('Title and description are required.');
      return;
    }

    try {
      setLoading(true);
      let uploadedUrl = '';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';

      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch(`${apiUrl}/api/approvals/upload`, {
          method: 'POST',
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedUrl = uploadData.url || '';
        } else {
          toast.error('Failed to upload file');
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`${apiUrl}/api/approvals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, fileUrl: uploadedUrl }),
      });

      if (!res.ok) {
        toast.error('Failed to create request');
        setLoading(false);
        return;
      }

      toast.success('Approval request created!');
      onSuccess();
      onClose();
    } catch (e) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <DialogTitle className="text-xl font-extrabold text-slate-900 tracking-tight">Create New Request</DialogTitle>
        </div>

        <div className="space-y-5 p-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Title</label>
            <Input
              placeholder="E.g., Special Discount Approval"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border-slate-200 focus-visible:ring-indigo-500 shadow-sm font-medium h-11"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Description</label>
            <Textarea
              placeholder="Provide details about the request..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="rounded-xl border-slate-200 focus-visible:ring-indigo-500 shadow-sm font-medium resize-none"
            />
          </div>
          <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">File Attachment (Optional)</label>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="bg-white rounded-lg cursor-pointer file:text-indigo-600 file:font-bold file:bg-indigo-50 file:border-0 hover:file:bg-indigo-100 transition-all text-slate-600 text-sm"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={loading} className="font-bold rounded-xl text-slate-500 hover:text-slate-700">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all px-6">
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
