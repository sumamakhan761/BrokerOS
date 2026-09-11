// ============================================================================
// BrokerOS — SMS Conversation Thread Component
// ============================================================================

import React, { useRef, useEffect } from 'react';
import type { SmsMessage } from '../../types/inbox';
import { SmsMessageBubble } from './SmsMessageBubble';
import { Loader2, MessageSquare } from 'lucide-react';

interface SmsConversationThreadProps {
  messages: SmsMessage[];
  loading?: boolean;
}

export const SmsConversationThread: React.FC<SmsConversationThreadProps> = ({
  messages,
  loading = false,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <MessageSquare className="w-5 h-5" />
        </div>
        <p className="text-xs font-bold text-slate-700">No messages in this SMS thread</p>
        <p className="text-[11px] text-slate-400 max-w-xs">
          Send your first text message using the composer below or use AI to draft an instant reply.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1 bg-slate-50/40">
      {messages.map((msg) => (
        <SmsMessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};
