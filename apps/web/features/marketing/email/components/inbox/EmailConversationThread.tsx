// ============================================================================
// BrokerOS — Email Conversation Thread Component
// ============================================================================

import React, { useRef, useEffect } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import type { EmailMessage } from '../../types/inbox';
import { EmailMessageBubble } from './EmailMessageBubble';

interface EmailConversationThreadProps {
  messages: EmailMessage[];
  loading?: boolean;
}

export const EmailConversationThread: React.FC<EmailConversationThreadProps> = ({
  messages,
  loading = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 bg-radial from-transparent to-bg-base/40"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full text-text-tertiary space-y-2 py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-xs">Loading email conversation thread...</span>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2 py-16">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-text-primary">No messages in this thread yet</p>
          <p className="text-[11px] text-text-secondary max-w-xs">
            Compose a message below to reach out to the client. Outbound replies preserve dedicated domain and provider headers.
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <EmailMessageBubble key={message.id} message={message} />
        ))
      )}
    </div>
  );
};
