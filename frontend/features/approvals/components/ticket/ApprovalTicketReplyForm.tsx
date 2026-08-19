import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { CheckCircle2, MessageCircle, XCircle, RotateCcw } from 'lucide-react';

interface ApprovalTicketReplyFormProps {
  ticket: any;
  role: string;
  showReplyForm: boolean;
  setShowReplyForm: (val: boolean) => void;
  actionType: 'APPROVE' | 'REJECT' | 'REPLY';
  setActionType: (val: 'APPROVE' | 'REJECT' | 'REPLY') => void;
  replyTitle: string;
  setReplyTitle: (val: string) => void;
  replyDesc: string;
  setReplyDesc: (val: string) => void;
  setReplyFile: (val: File | null) => void;
  handleReply: () => void;
  handleRedo: () => void;
  loading: boolean;
}

export function ApprovalTicketReplyForm({
  ticket,
  role,
  showReplyForm,
  setShowReplyForm,
  actionType,
  setActionType,
  replyTitle,
  setReplyTitle,
  replyDesc,
  setReplyDesc,
  setReplyFile,
  handleReply,
  handleRedo,
  loading,
}: ApprovalTicketReplyFormProps) {
  if (ticket.status === 'CLOSED') {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 border-t border-slate-100 bg-white rounded-b-2xl">
      {!showReplyForm ? (
        <div className="flex items-center justify-center gap-4">
          {role === 'SALES_MANAGER' && ticket.status === 'REQUESTED' ? (
            <>
              <Button
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl shadow-sm transition-all"
                onClick={() => { setActionType('APPROVE'); setShowReplyForm(true); }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve Request
              </Button>
              <Button
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 font-bold rounded-xl shadow-sm transition-all"
                onClick={() => { setActionType('REJECT'); setShowReplyForm(true); }}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </>
          ) : role === 'SALES_MANAGER' && (ticket.status === 'APPROVED' || ticket.status === 'REJECTED') && ticket.redoCount < 2 ? (
            <Button
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-sm transition-all"
              onClick={handleRedo}
              disabled={loading}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Redo Decision ({2 - ticket.redoCount} left)
            </Button>
          ) : ticket.status === 'REQUESTED' ? (
            <Button
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl shadow-sm transition-all"
              onClick={() => setShowReplyForm(true)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {ticket.status === 'APPROVED' ? 'Push Back / Reply' : 'Send Message'}
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto animate-[fadeUp_0.3s_ease_forwards]">
          <h3 className="font-extrabold text-slate-900 text-lg">
            {actionType === 'APPROVE' ? 'Approve & Respond' : actionType === 'REJECT' ? 'Reject & Respond' : 'Write a Message'}
          </h3>
          <Input
            placeholder="Title (e.g., Approved with conditions)"
            value={replyTitle}
            onChange={(e: any) => setReplyTitle(e.target.value)}
            className="rounded-xl border-slate-200 focus-visible:ring-indigo-500 shadow-sm font-medium"
          />
          <Textarea
            placeholder="Write your detailed response here..."
            rows={3}
            value={replyDesc}
            onChange={(e: any) => setReplyDesc(e.target.value)}
            className="rounded-xl border-slate-200 focus-visible:ring-indigo-500 shadow-sm font-medium resize-none"
          />
          <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Attachment (Optional)</label>
            <Input
              type="file"
              onChange={(e: any) => setReplyFile(e.target.files?.[0] || null)}
              className="bg-white rounded-lg cursor-pointer file:text-indigo-600 file:font-bold file:bg-indigo-50 file:border-0 hover:file:bg-indigo-100 transition-all text-slate-600 text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowReplyForm(false)} disabled={loading} className="font-bold rounded-xl text-slate-500 hover:text-slate-700">
              Cancel
            </Button>
            <Button
              onClick={handleReply}
              disabled={loading}
              className={`font-bold rounded-xl shadow-sm transition-all ${actionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : actionType === 'REJECT' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {loading ? 'Sending...' : actionType === 'APPROVE' ? 'Approve Now' : actionType === 'REJECT' ? 'Reject Now' : 'Send Message'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
