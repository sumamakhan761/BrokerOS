// ============================================================================
// BrokerOS — Email Message Bubble Component
// ============================================================================

import React from 'react';
import {
  Check,
  CheckCheck,
  AlertCircle,
  Clock,
  FileText,
  Bot,
  User,
  Paperclip,
} from 'lucide-react';
import type { EmailMessage } from '../../types/inbox';

interface EmailMessageBubbleProps {
  message: EmailMessage;
}

export const EmailMessageBubble: React.FC<EmailMessageBubbleProps> = ({ message }) => {
  const isOutbound = message.direction === 'OUTBOUND';
  const isBot = message.senderType === 'bot' || message.isAiGenerated;

  const formatTime = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const renderStatus = () => {
    if (!isOutbound) return null;

    switch (message.status) {
      case 'OPENED':
      case 'CLICKED':
        return (
          <span title="Email opened by prospect">
            <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
          </span>
        );
      case 'DELIVERED':
        return (
          <span title="Delivered to mailbox">
            <CheckCheck className="w-3.5 h-3.5 text-white/80" />
          </span>
        );
      case 'SENT':
        return (
          <span title="Dispatched from server">
            <Check className="w-3.5 h-3.5 text-white/80" />
          </span>
        );
      case 'FAILED':
        return (
          <span title={message.failureReason || 'Delivery failed'}>
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          </span>
        );
      case 'PENDING':
      default:
        return <Clock className="w-3.5 h-3.5 text-white/60 animate-pulse" />;
    }
  };

  return (
    <div className={`flex w-full my-3 ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-xs text-sm relative transition-all ${isOutbound
            ? isBot
              ? 'bg-purple-600/90 text-white rounded-br-xs border border-purple-500/30'
              : 'bg-blue-600 text-white rounded-br-xs border border-blue-500/30'
            : 'bg-bg-surface text-text-primary rounded-bl-xs border border-border-default'
          }`}
      >
        {/* Sender Attribution Badge */}
        <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-white/10 dark:border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold opacity-90">
            {isOutbound ? (
              isBot ? (
                <>
                  <Bot className="w-3.5 h-3.5 text-purple-200" />
                  <span>AI Automated Reply</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-blue-200" />
                  <span>{message.senderName || 'Agent'}</span>
                </>
              )
            ) : (
              <span className="text-text-primary font-semibold">{message.senderName || message.fromEmail}</span>
            )}
          </div>

          <span className={`text-[10px] ${isOutbound ? 'text-white/70' : 'text-text-tertiary'}`}>
            {formatTime(message.sentAt || message.createdAt)}
          </span>
        </div>

        {/* Email Subject Line (if present) */}
        {message.subject && (
          <div className={`text-xs font-semibold mb-2 ${isOutbound ? 'text-white/95' : 'text-text-primary'}`}>
            Subject: {message.subject}
          </div>
        )}

        {/* Body Content */}
        {message.bodyHtml ? (
          <div
            className={`prose prose-xs max-w-none break-words leading-relaxed text-xs ${isOutbound ? 'prose-invert text-white' : 'text-text-secondary'
              }`}
            dangerouslySetInnerHTML={{ __html: message.bodyHtml }}
          />
        ) : (
          <p className={`text-xs whitespace-pre-wrap leading-relaxed ${isOutbound ? 'text-white' : 'text-text-secondary'}`}>
            {message.bodyText}
          </p>
        )}

        {/* Attachments Section */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3 pt-2 border-t border-white/10 dark:border-white/10 space-y-1.5">
            {message.attachments.map((att, idx) => (
              <a
                key={idx}
                href={att.url}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-2 p-2 rounded-xl text-xs transition-colors ${isOutbound ? 'bg-black/15 hover:bg-black/25 text-white' : 'bg-bg-subtle hover:bg-bg-muted text-text-primary'
                  }`}
              >
                <Paperclip className="w-3.5 h-3.5 shrink-0 opacity-70" />
                <span className="truncate flex-1 font-medium">{att.name}</span>
                {att.size && (
                  <span className="text-[10px] opacity-70">{Math.round(att.size / 1024)} KB</span>
                )}
              </a>
            ))}
          </div>
        )}

        {/* Outbound Delivery Status Receipt */}
        {isOutbound && (
          <div className="flex items-center justify-end gap-1 mt-2 text-[10px] opacity-80">
            {renderStatus()}
          </div>
        )}
      </div>
    </div>
  );
};
