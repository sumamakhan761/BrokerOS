import React, { useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle2, XCircle, RotateCcw, Paperclip, Send } from 'lucide-react';

interface ApprovalTicketReplyFormProps {
  ticket: any;
  role: string;
  replyDesc: string;
  setReplyDesc: (val: string) => void;
  replyFile: File | null;
  setReplyFile: (val: File | null) => void;
  handleReply: () => void;
  handleRedo: () => void;
  handleInstantAction: (action: 'APPROVE' | 'REJECT') => void;
  loading: boolean;
}

export function ApprovalTicketReplyForm({
  ticket,
  role,
  replyDesc,
  setReplyDesc,
  replyFile,
  setReplyFile,
  handleReply,
  handleRedo,
  handleInstantAction,
  loading,
}: ApprovalTicketReplyFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (ticket.status === 'CLOSED') {
    return null;
  }

  return (
    <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl flex flex-col gap-3">
      {/* Action Buttons for Manager */}
      {role === 'SALES_MANAGER' && ticket.status === 'REQUESTED' && (
        <div className="flex items-center justify-center gap-2 mb-2">
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 font-bold rounded-lg shadow-sm transition-all text-xs"
            onClick={() => handleInstantAction('APPROVE')}
            disabled={loading}
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Approve
          </Button>
          <Button
            size="sm"
            className="bg-rose-600 hover:bg-rose-700 font-bold rounded-lg shadow-sm transition-all text-xs"
            onClick={() => handleInstantAction('REJECT')}
            disabled={loading}
          >
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            Reject
          </Button>
        </div>
      )}
      
      {role === 'SALES_MANAGER' && (ticket.status === 'APPROVED' || ticket.status === 'REJECTED') && ticket.redoCount < 2 && (
        <div className="flex justify-center mb-2">
          <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-sm transition-all text-xs"
            onClick={handleRedo}
            disabled={loading}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Redo Decision ({2 - ticket.redoCount} left)
          </Button>
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="flex flex-col gap-2">
        {replyFile && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg self-start text-xs font-semibold text-indigo-700">
            <Paperclip className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px]">{replyFile.name}</span>
            <button onClick={() => setReplyFile(null)} className="ml-1 text-indigo-400 hover:text-indigo-600">
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={(e: any) => setReplyFile(e.target.files?.[0] || null)}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            title="Attach File"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <Input
            placeholder="Type a message..."
            value={replyDesc}
            onChange={(e: any) => setReplyDesc(e.target.value)}
            className="flex-1 rounded-full border-slate-200 bg-slate-50 focus-visible:ring-indigo-500 shadow-none font-medium px-4 h-11"
            onKeyDown={(e: any) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleReply();
              }
            }}
          />
          
          <button 
            onClick={handleReply}
            disabled={loading || (!replyDesc.trim() && !replyFile)}
            className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
