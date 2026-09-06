// ============================================================================
// BrokerOS — WhatsApp Message Bubble Component
// ============================================================================

import React from 'react';
import {
  Check,
  CheckCheck,
  AlertCircle,
  Clock,
  FileText,
  Play,
  Bot,
  User,
} from 'lucide-react';
import type { WhatsAppMessage } from '../../types';

interface MessageBubbleProps {
  message: WhatsAppMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isOutbound = message.direction === 'OUTBOUND';
  const isBot = message.senderType === 'bot';
  const isAgent = message.senderType === 'agent';

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
      case 'READ':
        return <CheckCheck className="w-3.5 h-3.5 text-blue-500" />;
      case 'DELIVERED':
        return <CheckCheck className="w-3.5 h-3.5 text-text-tertiary" />;
      case 'SENT':
        return <Check className="w-3.5 h-3.5 text-text-tertiary" />;
      case 'FAILED':
        return (
          <span title={message.failureReason || 'Failed to deliver'}>
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          </span>
        );
      case 'PENDING':
      default:
        return <Clock className="w-3.5 h-3.5 text-text-tertiary animate-pulse" />;
    }
  };

  return (
    <div
      className={`flex w-full my-1.5 ${
        isOutbound ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[75%] md:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm text-sm relative transition-all ${
          isOutbound
            ? isBot
              ? 'bg-purple-600/90 text-white rounded-br-xs border border-purple-500/30'
              : 'bg-emerald-600 text-white rounded-br-xs border border-emerald-500/30'
            : 'bg-bg-surface text-text-primary rounded-bl-xs border border-border-default'
        }`}
      >
        {/* Sender Attribution Badge */}
        {isOutbound && (
          <div className="flex items-center gap-1 text-[10px] font-medium opacity-80 mb-1">
            {isBot ? (
              <>
                <Bot className="w-3 h-3 text-purple-200" />
                <span>Automated Bot</span>
              </>
            ) : (
              <>
                <User className="w-3 h-3 text-emerald-200" />
                <span>{message.senderName || 'Agent'}</span>
              </>
            )}
          </div>
        )}

        {/* Media Preview (Image, Document, Audio, Video) */}
        {message.mediaUrl && (
          <div className="mb-2 rounded-lg overflow-hidden max-w-sm">
            {message.type === 'IMAGE' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={message.mediaUrl}
                alt="Attachment"
                className="w-full max-h-60 object-cover rounded-lg"
              />
            ) : message.type === 'VIDEO' ? (
              <video
                controls
                src={message.mediaUrl}
                className="w-full max-h-60 rounded-lg bg-black/20"
              />
            ) : message.type === 'DOCUMENT' ? (
              <a
                href={message.mediaUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-2.5 bg-black/10 rounded-lg hover:bg-black/20 transition-colors"
              >
                <FileText className="w-6 h-6 shrink-0" />
                <span className="truncate font-medium text-xs">
                  {message.caption || 'Download Document'}
                </span>
              </a>
            ) : message.type === 'AUDIO' ? (
              <div className="flex items-center gap-2 p-2 bg-black/10 rounded-lg">
                <Play className="w-4 h-4 shrink-0" />
                <audio controls src={message.mediaUrl} className="h-7 w-48" />
              </div>
            ) : null}
          </div>
        )}

        {/* Template Header Badge */}
        {message.type === 'TEMPLATE' && (
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-white/20 text-[10px] font-semibold tracking-wider uppercase opacity-90">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-200" />
              <span>{message.template?.name || 'HSM Template'}</span>
            </div>
            {message.template?.category && (
              <span className="px-1.5 py-0.5 rounded bg-white/20 text-[9px]">
                {message.template.category}
              </span>
            )}
          </div>
        )}

        {/* Template Header Text */}
        {message.template?.headerText && (
          <div className="font-semibold text-xs mb-1 opacity-95">
            {message.template.headerText}
          </div>
        )}

        {/* Message Text Body */}
        {(message.body || message.template?.bodyText || (message.type === 'TEMPLATE' && message.caption)) ? (
          <p className="whitespace-pre-wrap leading-relaxed break-words">
            {message.body || message.template?.bodyText || message.caption}
          </p>
        ) : message.type === 'TEMPLATE' ? (
          <p className="italic text-xs opacity-85 leading-relaxed">
            [Template: {message.caption || 'Meta approved template message delivered'}]
          </p>
        ) : null}

        {/* Template Footer Text */}
        {message.template?.footerText && (
          <div className="text-[10px] mt-1.5 opacity-75">
            {message.template.footerText}
          </div>
        )}

        {/* Template Buttons */}
        {Array.isArray(message.template?.buttons) && message.template.buttons.length > 0 && (
          <div className="mt-2.5 space-y-1 pt-1.5 border-t border-white/20">
            {message.template.buttons.map((btn: any, idx: number) => (
              <div
                key={idx}
                className="py-1 px-2.5 rounded bg-white/15 text-center text-xs font-semibold backdrop-blur-xs"
              >
                {btn.text || btn.url || `Button ${idx + 1}`}
              </div>
            ))}
          </div>
        )}

        {/* Interactive Buttons / Choices Rendering */}
        {message.interactivePayload && (
          <div className="mt-2.5 space-y-1 pt-1.5 border-t border-white/20">
            {message.interactivePayload.buttons?.map((btn: any, idx: number) => (
              <div
                key={idx}
                className="py-1 px-2.5 rounded bg-white/15 text-center text-xs font-semibold backdrop-blur-xs"
              >
                {btn.title}
              </div>
            ))}
            {message.interactivePayload.sections?.map((sec: any, idx: number) => (
              <div key={idx} className="space-y-1">
                {sec.rows?.map((row: any, rIdx: number) => (
                  <div
                    key={rIdx}
                    className="py-1 px-2.5 rounded bg-white/15 text-left text-xs"
                  >
                    <span className="font-semibold">{row.title}</span>
                    {row.description && (
                      <span className="block text-[10px] opacity-80">
                        {row.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Footer info: time & delivery ticks */}
        <div
          className={`flex items-center justify-end gap-1.5 mt-1 text-[11px] ${
            isOutbound ? 'text-white/80' : 'text-text-tertiary'
          }`}
        >
          <span>{formatTime(message.sentAt || message.createdAt)}</span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
};
