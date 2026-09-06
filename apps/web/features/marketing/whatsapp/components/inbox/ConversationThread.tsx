// ============================================================================
// BrokerOS — WhatsApp Conversation Thread Message Stream
// ============================================================================

import React, { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import type { WhatsAppMessage } from '../../types';

interface ConversationThreadProps {
  messages: WhatsAppMessage[];
  loading?: boolean;
  is24HourWindowActive?: boolean;
  onOpenTemplatePicker?: () => void;
}

export const ConversationThread: React.FC<ConversationThreadProps> = ({
  messages,
  loading = false,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 bg-bg-base/60">

      {loading ? (
        <div className="flex items-center justify-center h-48 text-xs text-text-tertiary">
          Loading messages...
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-2">
          <div className="p-3 rounded-full bg-bg-subtle text-text-muted">
            <MessageSquare className="w-6 h-6" />
          </div>
          <p className="text-xs text-text-secondary font-medium">
            No messages in this conversation yet.
          </p>
          <p className="text-[11px] text-text-tertiary max-w-xs">
            Send an HSM template to initiate customer outreach or reply to an inbound message.
          </p>
        </div>
      ) : (
        messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
      )}

      <div ref={bottomRef} />
    </div>
  );
};
