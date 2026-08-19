'use client';
import React, { useState } from 'react';
import { ApprovalTicketHeader } from '@/features/approvals/components/ticket/ApprovalTicketHeader';
import { ApprovalTicketMessages } from '@/features/approvals/components/ticket/ApprovalTicketMessages';
import { ApprovalTicketReplyForm } from '@/features/approvals/components/ticket/ApprovalTicketReplyForm';
import { toast } from 'sonner';

export default function ApprovalTicket({
  ticket,
  role, // 'SALES_EXECUTIVE' | 'SALES_MANAGER'
  onBack,
  onUpdate,
}: {
  ticket: any;
  role: string;
  onBack: () => void;
  onUpdate: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyTitle, setReplyTitle] = useState('');
  const [replyDesc, setReplyDesc] = useState('');
  const [replyFile, setReplyFile] = useState<File | null>(null);

  // For the manager's action when replying
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'REPLY'>('REPLY');

  const handleReply = async () => {
    if (!replyTitle || !replyDesc) {
      toast.error('Title and description are required.');
      return;
    }

    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';

      let uploadedUrl = '';
      if (replyFile) {
        const formData = new FormData();
        formData.append('file', replyFile);

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

      const res = await fetch(`${apiUrl}/api/approvals/${ticket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: replyTitle,
          description: replyDesc,
          fileUrl: uploadedUrl,
          action: actionType,
        }),
      });

      if (!res.ok) {
        toast.error('Failed to submit message');
        setLoading(false);
        return;
      }

      toast.success(actionType === 'APPROVE' ? 'Request Approved!' : actionType === 'REJECT' ? 'Request Rejected!' : 'Message Sent!');
      setShowReplyForm(false);
      setReplyTitle('');
      setReplyDesc('');
      setReplyFile(null);
      onUpdate();
    } catch (e) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/approvals/${ticket.id}/close`, {
        method: 'PATCH',
      });
      if (res.ok) {
        toast.success('Ticket closed');
        onUpdate();
      } else {
        toast.error('Failed to close ticket');
      }
    } catch (e) {
      toast.error('Error closing ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleRedo = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/approvals/${ticket.id}/redo`, {
        method: 'POST',
      });
      if (res.ok) {
        toast.success('Action Undone');
        onUpdate();
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to redo decision');
      }
    } catch (e) {
      toast.error('Error undoing action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col transition-all duration-300 hover:shadow-md">
      <ApprovalTicketHeader
        ticket={ticket}
        role={role}
        onBack={onBack}
        handleCloseTicket={handleCloseTicket}
        loading={loading}
      />
      
      <ApprovalTicketMessages
        ticket={ticket}
        role={role}
      />

      <ApprovalTicketReplyForm
        ticket={ticket}
        role={role}
        showReplyForm={showReplyForm}
        setShowReplyForm={setShowReplyForm}
        actionType={actionType}
        setActionType={setActionType}
        replyTitle={replyTitle}
        setReplyTitle={setReplyTitle}
        replyDesc={replyDesc}
        setReplyDesc={setReplyDesc}
        setReplyFile={setReplyFile}
        handleReply={handleReply}
        handleRedo={handleRedo}
        loading={loading}
      />
    </div>
  );
}
